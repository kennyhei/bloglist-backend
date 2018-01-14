const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const formatBlog = (blog) => {
    return {
        id: blog._id,
        user: blog.user,
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: blog.likes
    }
}

const decodeToken = (token) => {

    let decodedToken

    try {
        decodedToken = jwt.verify(token, process.env.SECRET)
    } catch (error) {
        return null
    }

    return decodedToken
}

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })

    response.json(blogs.map(formatBlog))
})

blogsRouter.post('/', async (request, response) => {

    try {

        let decodedToken

        //console.log(request.token)
        try {
            decodedToken = jwt.verify(request.token, process.env.SECRET)
        } catch (error) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }

        const body = request.body

        if (!body.title) {
            return response.status(400).json({ error: 'title missing' })
        }

        if (!body.author) {
            return response.status(400).json({ error: 'author missing' }) 
        }

        const user = await User.findById(decodedToken.id)

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url || null,
            likes: body.likes || 0,
            user: user._id
        })

        const savedBlog = await blog.save()

        user.blogs.push(savedBlog._id)
        await user.save()

        savedBlog.user = user

        response.status(201).json(formatBlog(savedBlog))
    } catch (error) {
        console.log(error)
        response.status(500).json({ error: 'something went wrong...' })
    }
})

blogsRouter.delete('/:id', async (request, response) => {

    try {
        const blog = await Blog.findById(request.params.id)

        if (blog.user) {
            let decodedToken = decodeToken(request.token)

            if (!decodedToken) {
                return response.status(401).json({ error: 'token missing or invalid' })
            }

            if (blog.user.toString() !== decodedToken.id) {
                return response.status(403).json({ error: 'no rights to remove blog' })
            }
        }
    
        await blog.remove()
        response.status(204).end()
    } catch (error) {
        response.status(400).send({ error: 'malformatted id' })
    }
})

blogsRouter.put('/:id', async (request, response) => {

    /*let decodedToken

    try {
        decodedToken = jwt.verify(request.token, process.env.SECRET)
    } catch (error) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    
    if (blog.user.toString() !== decodedToken.id) {
        return response.status(403).json({ error: 'no rights to update blog' })
    }*/

    try {
        const blog = await Blog.findById(request.params.id)

        const body = request.body
        blog.set({ likes: body.likes })

        const updatedBlog = await blog.save()
        response.json(formatBlog(updatedBlog))
    } catch (error) {
        response.status(400).send({ error: 'malformatted id' })
    }
})

module.exports = blogsRouter