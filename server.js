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
const Room = require('./lib/room')
const roomList = ['trash', 'geniuses']
const rooms = {}


for(let i=0; i < roomList.length; i++)  {
    rooms[roomList[i]] = new Room(roomList[i], io)
    rooms[roomList[i]].getNewTrack()
}


//set static folder
app.use(express.static(path.join(__dirname, 'public')))


//Run when client connects
io.on('connection', socket => {

    socket.on('setnickname', data => {
        if(socket.roomname) {
            rooms[socket.roomname].setNickname(socket, data)
        }
        
    })

    socket.on('joinroom', data => {
        socket.roomname = data
        socket.join(data)
    })
    
    socket.on('guess', data => {
        if(socket.roomname) {
           rooms[socket.roomname].guess(data.text, socket)
        }
    })

    //Runs when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the game')
        if(socket.roomname) {
            rooms[socket.roomname].userLeft(socket)
        }
    })
})

app.get('/:room', (req, res) => {
    let room = req.params.room
    if(roomList.indexOf(room)==-1){
        res.status(404)
        res.send('Are you lost?>)')
    } else {
        res.sendFile(path.join(__dirname, room+'.html'))
    }    
})




const PORT = 3000

server.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})