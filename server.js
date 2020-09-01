const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const request = require('request-promise')
const artistids = require('./utils/artist-ids')

const app = express()
const server =  http.createServer(app)
const io = socketio(server)




//set static folder
app.use(express.static(path.join(__dirname, 'public')))


//Run when client connects
io.on('connection', socket => {
    //Welcome a current user
    socket.emit('message', 'Welcome to chat')

    //Broadcast when connect
    socket.broadcast.emit('message', 'A user has joined the chat')


    //Runs when client disconnects
    socket.on('disconnect', socket => {
        io.emit('message', 'A user has left the chat')
    })
})


class Game {
    constructor(name, ids) {
        this.name = name
        this.ids  = ids
    }

    songPlayed = 0

    generateUri() {
        let rand = Math.random()*(this.ids.length-0.5)
        let uri = 'https://itunes.apple.com/lookup?id=' + this.ids[Math.round(rand)] + '&entity=song&limit=5&sort=recent'
        this.currentUri = uri
    }

    parseJson(json) {
        json.JSO
    }

    loadNextTrack() {
        this.generateUri()
        const options = {
            method:'Get',
            uri:this.currentUri,
            json:true
        }

        request(options).
            then(res => {
                this.initiateCurrentTrack(res)
                //console.log(res)
                this.showRes()
            })
    }

    initiateCurrentTrack(response) {
        const songNumber = Math.round(Math.random()*5)+1
        this.artistName = response.results[songNumber].artistName
        this.trackName = response.results[songNumber].trackName
    }

    showRes(){
        setTimeout(() => {
            this.songPlayed++
            console.log(this.artistName, this.trackName)
            this.loadNextTrack()
        }
    , 5000)
    }

}
const room = new Game('trash', artistids)

room.loadNextTrack()

const PORT = 3000

server.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})