const expect = require('chai').expect
const supertest = require('supertest')
const { app, server, startServer } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, blogsInDb, createUser, createTokenForUser } = require('./test_helper')

describe('when there is initially some blogs saved', () => {

    let token
    let user

    before(async () => {
        startServer()
        
        // Remove all documents
        await Blog.remove()

        // Convert note objects to mongoose Blog documents
        const blogObjects = initialBlogs.map(blog => new Blog(blog))

        // Convert Blog documents to promises returned by blog.save()
        const promiseArray = blogObjects.map(blog => blog.save())

        // Wait that all promises are resolved (i.e. all blogs have been saved)
        await Promise.all(promiseArray)

        user = await createUser('kennyhei')
        token = await createTokenForUser(user._id)
    })

    it('all blogs are returned as json by GET /api/blogs', async () => {
        const blogsInDatabase = await blogsInDb()

        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).to.equal(blogsInDatabase.length)
        
        const returnedBlogs = response.body.map(b => b.title)
        blogsInDatabase.forEach(blog => {
            expect(returnedBlogs).to.include(blog.title)
        })
    })

    describe('addition of a new blog', () => {

        it('POST /api/blogs fails if user has not authenticated', async () => {
            const newBlog = {
                author: 'Kenny Heinonen',
                likes: 5
            }

            const blogsAtBeginningOfOperation = await blogsInDb()
    
            const result = await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(401)

            expect(result.body).to.deep.equal({ error: 'token missing or invalid' })
    
            const blogsAfterOperation = await blogsInDb()
            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length)
        })

        it('POST /api/blogs fails with proper statuscode if title is missing', async () => {

            const newBlog = {
                author: 'Kenny Heinonen',
                likes: 5
            }

            const blogsAtBeginningOfOperation = await blogsInDb()
    
            const result = await api
                .post('/api/blogs')
                .set('Authorization', `bearer ${token}`)
                .send(newBlog)
                .expect(400)

            expect(result.body).to.deep.equal({ error: 'title missing' })
    
            const blogsAfterOperation = await blogsInDb()
            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length)
        })

        it('POST /api/blogs fails with proper statuscode if author is missing', async () => {
            const newBlog = {
                title: 'My road to becoming React guru',
                likes: 5
            }

            const blogsAtBeginningOfOperation = await blogsInDb()
    
            const result = await api
                .post('/api/blogs')
                .set('Authorization', `bearer ${token}`)
                .send(newBlog)
                .expect(400)

            expect(result.body).to.deep.equal({ error: 'author missing' })

            const blogsAfterOperation = await blogsInDb()
            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length)
        })

        it('POST /api/blogs succeeds with valid blog', async () => {
            const newBlog = {
                title: 'My road to becoming React guru',
                author: 'Kenny Heinonen',
                likes: 100
            }

            const blogsAtBeginningOfOperation = await blogsInDb()
    
            await api
                .post('/api/blogs')
                .set('Authorization', `bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)
    
            const blogsAfterOperation = await blogsInDb()

            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length + 1)

            const titles = blogsAfterOperation.map(r => r.title)
            expect(titles).to.include('My road to becoming React guru')
        })

        it('POST /api/blogs succeeds and sets likes to zero if not defined', async () => {
            const newBlog = {
                title: 'React course is fun',
                author: 'Kenny Heinonen'
            }

            const blogsAtBeginningOfOperation = await blogsInDb()
    
            await api
                .post('/api/blogs')
                .set('Authorization', `bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)
    
            const blogsAfterOperation = await blogsInDb()
            const latestBlog = blogsAfterOperation[blogsAfterOperation.length - 1]

            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length + 1)
            
            expect(latestBlog.title).to.equal(newBlog.title)
            expect(latestBlog.likes).to.equal(0)
        })
    })

    describe('deletion of a blog', () => {
        let addedBlog
        let otherToken

        before(async () => {
            addedBlog = new Blog({
                title: 'How to delete Blog',
                author: 'Kenny Heinonen',
                url: null,
                likes: 2,
                user: user._id
            })

            await addedBlog.save()

            const otherUser = await createUser('mluukkai')
            otherToken = await createTokenForUser(otherUser._id)
        })

        it('DELETE /api/blogs/:id fails with token that does not belong to original creator', async () => {
            const blogsAtBeginningOfOperation = await blogsInDb()
      
            const result = await api
                .delete(`/api/blogs/${addedBlog._id}`)
                .set('Authorization', `bearer ${otherToken}`)
                .expect(403)

            expect(result.body).to.deep.equal({ error: 'no rights to remove blog' })
            
            const blogsAfterOperation = await blogsInDb()
      
            const ids = blogsAfterOperation.map(r => r.id)
            expect(ids).to.deep.include(addedBlog._id)
            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length)
        })

        it('DELETE /api/blogs/:id fails with invalid token', async () => {
            const blogsAtBeginningOfOperation = await blogsInDb()
      
            const result = await api
                .delete(`/api/blogs/${addedBlog._id}`)
                .set('Authorization', 'bearer asdf')
                .expect(401)

            expect(result.body).to.deep.equal({ error: 'token missing or invalid' })
            
            const blogsAfterOperation = await blogsInDb()
      
            const ids = blogsAfterOperation.map(r => r.id)
            expect(ids).to.deep.include(addedBlog._id)
            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length)
        })

        it('DELETE /api/blogs/:id succeeds with proper status code and token', async () => {
            const blogsAtBeginningOfOperation = await blogsInDb()
      
            await api
                .delete(`/api/blogs/${addedBlog._id}`)
                .set('Authorization', `bearer ${token}`)
                .expect(204)
      
            const blogsAfterOperation = await blogsInDb()
      
            const ids = blogsAfterOperation.map(r => r.id)
            expect(ids).not.to.include(addedBlog._id)
            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length - 1)
        })
    })

    describe.skip('update of a blog', () => {
        let addedBlog
        let otherToken

        before(async () => {
            addedBlog = new Blog({
                title: 'How to update Blog',
                author: 'Kenny Heinonen',
                url: null,
                likes: 2,
                user: user._id
            })

            await addedBlog.save()

            const otherUser = await createUser('mluukkai')
            otherToken = await createTokenForUser(otherUser._id)
        })

        it('PUT /api/blogs/:id fails with invalid token', async () => {
            const blogsAtBeginningOfOperation = blogsInDb()

            const updatedLikes = {
                likes: 50
            }

            const result = await api
                .put(`/api/blogs/${addedBlog._id}`)
                .set('Authorization', 'bearer asdf')
                .send(updatedLikes)
                .expect(401)

            expect(result.body).to.deep.equal({ error: 'token missing or invalid' })

            const blogsAfterOperation = blogsInDb()
            const updatedBlog = await Blog.findById(addedBlog._id)

            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length)
            expect(addedBlog.likes).to.equal(2)
            expect(updatedBlog.likes).to.equal(2)
        })

        it('PUT /api/blogs/:id fails with token that does not belong to original author', async () => {
            const blogsAtBeginningOfOperation = blogsInDb()

            const updatedLikes = {
                likes: 50
            }

            const result = await api
                .put(`/api/blogs/${addedBlog._id}`)
                .set('Authorization', `bearer ${otherToken}`)
                .send(updatedLikes)
                .expect(403)

            expect(result.body).to.deep.equal({ error: 'no rights to update blog' })

            const blogsAfterOperation = blogsInDb()
            const updatedBlog = await Blog.findById(addedBlog._id)

            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length)
            expect(addedBlog.likes).to.equal(2)
            expect(updatedBlog.likes).to.equal(2)
        })

        it('PUT /api/blogs/:id udpates likes of a blog with correct token', async () => {
            const blogsAtBeginningOfOperation = blogsInDb()

            const updatedLikes = {
                likes: 50
            }

            await api
                .put(`/api/blogs/${addedBlog._id}`)
                .set('Authorization', `bearer ${token}`)
                .send(updatedLikes)
                .expect(200)

            const blogsAfterOperation = blogsInDb()
            const updatedBlog = await Blog.findById(addedBlog._id)

            expect(blogsAfterOperation.length).to.equal(blogsAtBeginningOfOperation.length)
            expect(addedBlog.likes).to.equal(2)
            expect(updatedBlog.likes).to.equal(50)
        })
    })

    after(() => {
        server.close()
    })
})