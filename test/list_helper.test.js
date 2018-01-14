const expect = require('chai').expect
const list = require('../utils/list_helper')

const listWithOneBlog = [
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5
    }
]

const listWithMultipleBlogs = [
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

describe('dummy', () => {

    it('is called', () => {
        const blogs = []
      
        const result = list.dummy(blogs)
        expect(result).to.equal(1)
    })
})

describe('total likes', () => {
  
    it('of empty list is zero', () => {
        expect(list.totalLikes([])).to.equal(0)
    })

    it('when list has only one blog equals the likes of that', () => {
        const result = list.totalLikes(listWithOneBlog)
        expect(result).to.equal(5)
    })

    it('of a bigger list is calculated right', () => {
        const result = list.totalLikes(listWithMultipleBlogs)
        expect(result).to.equal(50)
    })
})

describe('favorite blog', () => {
  
    it('of empty list is null', () => {
        expect(list.favoriteBlog([])).to.equal(null)
    })

    it('when list has only one blog equals that blog', () => {
        const result = list.favoriteBlog(listWithOneBlog)
        expect(result).to.deep.equal(listWithOneBlog[0])
    })

    it('of a bigger list is calculated right', () => {
        const result = list.favoriteBlog(listWithMultipleBlogs)
        expect(result).to.deep.equal(listWithMultipleBlogs[4])
    })
})

describe('most blogs', () => {

    it('of empty list is null', () => {
        expect(list.mostBlogs([])).to.equal(null)
    })

    it('when list has only one blog equals the author of that blog', () => {
        const result = list.mostBlogs(listWithOneBlog)

        expect(result).to.deep.equal({
            author: 'Edsger W. Dijkstra',
            blogs: 1
        })
    })

    it('of a bigger list is calculated right', () => {
        const result = list.mostBlogs(listWithMultipleBlogs)

        expect(result).to.deep.equal({
            author: 'Edsger W. Dijkstra',
            blogs: 3
        })
    })
})

describe('most likes', () => {

    it('of empty list is null', () => {
        expect(list.mostLikes([])).to.equal(null)
    })

    it('when list has only one blog equals the author of that blog', () => {
        const result = list.mostLikes(listWithOneBlog)

        expect(result).to.deep.equal({
            author: 'Edsger W. Dijkstra',
            likes: 5
        })
    })

    it('of a bigger list is calculated right', () => {
        const result = list.mostLikes(listWithMultipleBlogs)

        expect(result).to.deep.equal({
            author: 'Matti Luukkainen',
            likes: 35
        })
    })
})