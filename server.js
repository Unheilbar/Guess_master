const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const request = require('request-promise')
const artistids = require('./utils/artist-ids')

const app = express()
const server =  http.createServer(app)
const io = socketio(server)
const room = require('./lib/room')


const trash = new room('trash')

//set static folder
app.use(express.static(path.join(__dirname, 'public')))


//Run when client connects
io.on('connection', socket => {
    //Welcome a current user
    socket.emit('message', 'Welcome to chat')

    socket.on('setnickname', data => {
        trash.setNickname(socket, data)
        console.log(socket)
	})

    //Runs when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the game')
        trash.userLeft(socket)
    })
})




const PORT = 3000

server.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})