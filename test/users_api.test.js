const expect = require('chai').expect
const supertest = require('supertest')
const { app, server, startServer } = require('../index')
const api = supertest(app)
const User = require('../models/user')
const { usersInDb } = require('./test_helper')

describe('when there is initially one user in db', () => {

    before(async () => {
        startServer()
        await User.remove({})
        const user = new User({ username: 'root', password: 'secret' })
        await user.save()
    })

    it('POST /api/users succeeds with a fresh username', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAfterOperation = await usersInDb()

        expect(usersAfterOperation.length).to.equal(usersBeforeOperation.length + 1)
        const usernames = usersAfterOperation.map(u => u.username)
        expect(usernames).to.include(newUser.username)
    })

    it('POST /api/users fails with proper status code and message if username already exists', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
            username: 'root',
            name: 'superuser',
            password: 'salainen'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body).to.deep.equal({ error: 'username must be unique' })

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).to.equal(usersBeforeOperation.length)
    })

    it('POST /api/users fails with proper status code and message if password is too short', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
            username: 'kennyhei',
            name: 'Kenny Heinonen',
            password: 'ok'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body).to.deep.equal({ error: 'password must be at least 3 characters long' })

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).to.equal(usersBeforeOperation.length)
    })

    after(() => {
        server.close()
    })

})