const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server =  http.createServer(app)
const io = socketio(server)
const zalupa = {name:'zalupa'}
let id = 0

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Run when client connects
io.on('connection', socket => {
    //Welcome a current user
    socket.emit('message', 'Welcome to chat')

    //Broadcast when connect
    socket.broadcast.emit('message', 'A user has joined the chat')

    socket.emit('freak', newName())

    //Runs when client disconnects
    socket.on('disconnect', socket => {
        io.emit('message', 'A user has left the chat')
    })
})

function newName() {
    const newName = {name:zalupa.name}
    newName.name+=id
    id++
    return newName
}

const PORT = 3000

server.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})