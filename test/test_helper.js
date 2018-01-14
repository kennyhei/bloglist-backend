const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const initialBlogs = [
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5
    },
    {
        title: 'I am Edsger',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 4
    },
    {
        title: 'I love algorithms',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 6
    },
    {
        title: 'I am a coding guru',
        author: 'Matti Luukkainen',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 14
    },
    {
        title: 'Here is why you should study CS',
        author: 'Matti Luukkainen',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 21
    }
]

const format = (blog) => {
    return {
        id: blog._id,
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: blog.likes
    }
}

/* 
 *  Creates and removes blog from DB so we
 *  can have id that no longer exists in DB
**/
const nonExistingId = async () => {
    const blog = new Blog()
    await blog.save()
    await blog.remove()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(format)
}

const usersInDb = async () => {
    const users = await User.find({})
    return users
}

const createUser = async (username) => {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash('secret', saltRounds)

    const user = new User({
        username,
        name: 'Kenny Heinonen',
        passwordHash,
        adult: true
    })

    return await user.save()
}

const createTokenForUser = async (id) => {
    const user = await User.findById(id)

    const userForToken = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET)
    return token
}

module.exports = {
    initialBlogs,
    format,
    nonExistingId,
    blogsInDb,
    usersInDb,
    createUser,
    createTokenForUser
}
