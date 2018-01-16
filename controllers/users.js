const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

const formatUser = (user) => {
    return {
        id: user._id,
        username: user.username,
        name: user.name,
        adult: user.adult,
        blogs: user.blogs
    }
}

usersRouter.get('/', async (requets, response) => {
    const users = await User
        .find({})
        .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })

    response.json(users.map(formatUser))
})

usersRouter.post('/', async (request, response) => {

    try {
        const body = request.body

        const existingUser = await User.find({ username: body.username })
        if (existingUser.length > 0) {
            return response.status(400).json({ error: 'username must be unique' })
        }

        if (!body.password || body.password.length < 3) {
            return response.status(400).json({ error: 'password must be at least 3 characters long' })
        }

        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)

        const user = new User({
            username: body.username,
            name: body.username,
            passwordHash,
            adult: body.adult || true
        })

        const savedUser = await user.save()
        response.json(formatUser(savedUser))

    } catch (error) {
        console.log(error)
        response.status(500).send({ error: 'something went wrong...' })
    }
})

module.exports = usersRouter
