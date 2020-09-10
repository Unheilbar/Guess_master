const artistids = require('../utils/artist-ids')
const request = require('request-promise')
const match = require('./checkMatch')

class Room {
    constructor(name, io) {
        this.name = name
        this.io = io 
    }

    userList = []
    sockets = { }
    usersData = { }
    trackscount = 0
    songsPerRound = 10

    addUser(socket) {
        this.sockets[socket.nickname] = socket
        this.usersData[socket.nickname] = {
			nickname:socket.nickname,
			points:0,
			roundpoints:0,
			matched:null
		}
    }

    removeUser(socket) {
		// Delete the references
		delete this.sockets[socket.nickname]
        delete this.usersData[socket.nickname]
        
	}

    userExists(nickname) {
        const user = this.usersData[nickname]
		return user ? true : false
    }

    getUserSocket (nickname) {
		return this.sockets[nickname]
    }
    
    setNickname(socket, data) {
        if(this.userExists(data.nickname)) {
            const feedback = "The nickname has already taken"
            return this.invalidNickname(socket, feedback)
        }
        if(data.nickname.length>10) {
            const feedback = "Nickname should contain less than 10 characters"
            return this.invalidNickname(socket, feedback)
        }
        
        if(socket.nickname){
            this.userLeft(socket)
        }
        socket.nickname = data.nickname

        this.addUser(socket)
        this.io.sockets.emit('updateuserlist', {users:this.usersData,trackscount:this.trackscount})
        socket.emit('ready', {users:this.usersData,trackscount:this.trackscount})
    }

    userLeft(socket) {
        if(socket.nickname != undefined) {
            this.removeUser(socket)
            socket.broadcast.emit('updateuserlist', {users:this.usersData,trackscount:this.trackscount})
            console.log(`user ${socket.nickname} has been removed`)
        }
    }

    invalidNickname(socket, feedback) {
        socket.emit('invalidnickname', {feedback:feedback})
    }
    

    ids = artistids

    generateUri() {
        let rand = Math.random() * (this.ids.length - 0.5)
        let uri = 'https://itunes.apple.com/lookup?id=' + this.ids[Math.round(rand)] + '&entity=song&limit=5&sort=recent'
        this.currentUri = uri
    }

    initiateCurrentTrack(response) {
        const songNumber = Math.round(Math.random() * 3) + 1
        this.artistName = response.results[songNumber].artistName
        this.trackName = response.results[songNumber].trackName
        this.previewUrl = response.results[songNumber].previewUrl
    }


    getNewTrack() {
        this.generateUri()
        const options = {
            method: 'Get',
            uri: this.currentUri,
            json: true
        }

        try {
            request(options).
                then(res => {
                    this.initiateCurrentTrack(res)
                    this.sendPlayTrack()
                    
                })
        } catch (e) {
            getNewTrack()
        }
    }

    sendPlayTrack() {
        if(this.previewUrl==undefined) {
            this.getNewTrack()
            return
        }
        this.trackscount++
        this.io.sockets.emit('playtrack', {trackUrl:this.previewUrl})
        setTimeout(this.sendTrackInfo.bind(this), 35000)
    }

    guess(text, socket) {
        console.log(match(text, this.artistName+this.trackName))
        console.log(this.artistName+this.trackName)
        if(!this.usersData[socket.nickname].matched) {
            if(match(text, this.artistName+this.trackName)) {
                this.usersData[socket.nickname].matched = 'both'
                this.usersData[socket.nickname].points += 5
                this.io.sockets.emit('updateuserlist', {users:this.usersData,trackscount:this.trackscount})
                return
            }
            if(match(text, this.artistName)) {
                this.usersData[socket.nickname].matched = 'artist'
                this.usersData[socket.nickname].points += 2
            }
            if(match(text, this.trackName)) {
                this.usersData[socket.nickname].matched = 'track'
                this.usersData[socket.nickname].points += 3
            }
        }
        if(this.usersData[socket.nickname].matched == 'artist'){
            if(match(text, this.trackName)) {
                this.usersData[socket.nickname].matched = 'both'
                this.usersData[socket.nickname].points += 2
            }
        }
        if(this.usersData[socket.nickname].matched == 'track'){
            if(match(text, this.artistName)) {
                this.usersData[socket.nickname].matched = 'both'
                this.usersData[socket.nickname].points += 3
            }
        }
        this.io.sockets.emit('updateuserlist', {users:this.usersData,trackscount:this.trackscount})
        console.log(this.usersData[socket.nickname].nickname, ' : ', text)
    }

    resetPoints() {
        for(let key in this.usersData) {
            this.usersData[key].matched = null
        }
    }

    sendTrackInfo() {      
        this.io.sockets.emit('trackinfo', {
            artistName:this.artistName,
            trackName:this.trackName
        })
        this.resetPoints()
        console.log(this.trackscount)
        if(this.trackscount<this.songsPerRound){
            this.getNewTrack()
        } else {
            this.gameOver()
        }
    }

    
    gameOver() {
        this.io.sockets.emit('gameover', {usersData:this.usersData})
        this.trackscount = 0
        setTimeout(this.getNewTrack.bind(this), 5000)
    }




}

module.exports = Room