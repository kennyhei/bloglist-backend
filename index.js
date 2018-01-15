const http = require('http')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const middleware = require('./utils/middleware')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)

morgan.token('data', (req) => {
    return JSON.stringify(req.body)
})

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(':method :url :data :status :res[content-length] - :response-time ms'))
}

mongoose.connect(config.mongoUrl)
mongoose.Promise = global.Promise

const loginRouter = require('./controllers/login')
app.use('/api/login', loginRouter)

const usersRouter = require('./controllers/users')
app.use('/api/users', usersRouter)

const blogsRouter = require('./controllers/blogs')
app.use('/api/blogs', blogsRouter)

let server = http.createServer(app)
const PORT = config.port

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
  
server.on('close', () => {
    mongoose.connection.close()
})

const startServer = async () => {
    if (server._handle !== null) {
        return
    }

    await server.close()
    mongoose.connect(config.mongoUrl)
    server = http.createServer(app)
}

module.exports = {
    app, server, startServer
}
