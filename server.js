const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const config = require('./config').config()

const app = express()
const server =  http.createServer(app)
const io = socketio(server)
const Room = require('./lib/room')
const rooms = {}


for(let i=0; i < config.rooms.length; i++)  {
    rooms[config.rooms[i]] = new Room(config.rooms[i], io)
    rooms[config.rooms[i]].start()
}


//set static folder
app.use(express.static(path.join(__dirname, 'public')))


//Run when client connects
io.on('connection', socket => {
    socket.on('setnickname', data => {
        if(!socket.nickname && typeof data == 'object' && typeof data.nickname == 'string' && data.nickname!='')
        rooms[data.roomname].setNickname(socket, data)
        
    })

    socket.on('guess', data => {
        if(socket.roomname && typeof data === "string") {
           rooms[socket.roomname].guess(data, socket)
        }
    })

    socket.on('getstatus', function() {
		if (socket.roomname) {
			rooms[socket.roomname].sendStatus(socket);
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
    if(config.rooms.indexOf(room)==-1){
        res.status(404)
        res.send('Are you lost?>)')
    } else {
        res.sendFile(path.join(__dirname, room+'.html'))
    }    
})

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.ico'))
})


server.listen(config.port, () => {console.log(`Server running on port ${config.port}`)})