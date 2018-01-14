const dummy = () => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => {
        return sum + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {

    if (blogs.length === 0) {
        return null
    }

    return blogs.reduce((favorite, blog) => {
        if (blog.likes > favorite.likes) {
            return blog
        } else {
            return favorite
        }
    }, blogs[0])
}

const mostBlogs = (blogs) => {

    if (blogs.length === 0) {
        return null
    }

    const authors = _authorsWithProperty(blogs, 'blogs')
    const mostBlogsAuthor = _authorWithMost(authors, 'blogs')

    return {
        author: mostBlogsAuthor,
        blogs: authors[mostBlogsAuthor].blogs
    }
}

const mostLikes = (blogs) => {

    if (blogs.length === 0) {
        return null
    }

    const authors = _authorsWithProperty(blogs, 'likes')
    const mostLikesAuthor = _authorWithMost(authors, 'likes')

    return {
        author: mostLikesAuthor,
        likes: authors[mostLikesAuthor].likes
    }
}

const _authorsWithProperty = (blogs, property) => {

    let authors = {}

    blogs.forEach(blog => {

        if (!authors[blog.author]) {
            authors[blog.author] = { [property]: 0 }
        }

        if (!blog[property]) {
            authors[blog.author][property] += 1
        } else {
            authors[blog.author][property] += blog[property]
        }
    })

    return authors
}

const _authorWithMost = (authors, property) => {
    return Object.keys(authors).reduce((a, b) => {
        
        if (authors[a][property] > authors[b][property]) {
            return a
        } else {
            return b
        }
    })
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}