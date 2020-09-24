const request = require('request-promise')
const match = require('./utils/checkMatch')
const config = require('../config').config()
const getOptions = require('./utils/getOptions')

class Room {
    constructor(name, io) {
        this.name = name
        this.io = io 
    }

    urls = null
    userList = []
    sockets = { }
    usersData = { }
    trackscount = 0
    songsPerRound = config.songsPerRound
    guessAllow = false
    songtimeleft = 0
    status = 0 // - 0 the song is currently playing/1 - loading the next song/2 - last track info sending/3 - game over

    //User logic
    addUser(socket) {
        this.sockets[socket.nickname] = socket
        this.usersData[socket.nickname] = {
			nickname:socket.nickname,
			points:0,
			roundpoints:0,
			matched:null
        }

        socket.emit('ready', {users:this.usersData,trackscount:this.trackscount})
        socket.broadcast.to(this.name).emit('newuser', {nickname:socket.nickname,users:this.usersData})
        console.log(`user ${this.usersData[socket.nickname].nickname} has joined the room`)
        console.log(`current users data: ${Object.keys(this.usersData)}`) 
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
        let feedback
        if(this.userExists(data.nickname)) {
            feedback = "The nickname has already taken"
            return this.invalidNickname(socket, feedback)
        }

        if(data.nickname.length>config.minNicknameLength) {
            feedback = `Nickname should contain less than ${config.minNicknameLength} characters`
            return this.invalidNickname(socket, feedback)
        }

        if(data.nickname=='') {
            feedback = `Nickname can't be empty`
            return this.invalidNickname(socket, feedback)
        }
        
        if(socket.nickname){
            this.userLeft(socket)
        }

        socket.nickname = data.nickname
        socket.roomname = data.roomname
        socket.join(data.roomname)
        this.addUser(socket)
        this.io.sockets.in(this.name).emit('updateuserlist', {users:this.usersData,trackscount:this.trackscount})
    }

    userLeft(socket) {
        if(socket.nickname != undefined) {
            this.removeUser(socket)
            this.io.sockets.in(this.name).emit('userleft', {users:this.usersData,trackscount:this.trackscount})
            console.log(`user ${socket.nickname} has been removed`)
        }
    }

    invalidNickname(socket, feedback) {
        socket.emit('invalidnickname', {feedback:feedback})
    }

    guess(text, socket) {
        console.log(this.artistName, " : ", this.trackName)
        console.log(this.usersData)
        if(this.guessAllow) {
            if(!this.usersData[socket.nickname].matched) {
                if(match(text, this.artistName+this.trackName)) {
                    this.usersData[socket.nickname].matched = 'both'
                    this.usersData[socket.nickname].points += 5
                    this.io.sockets.in(this.name).emit('updateuserlist', {users:this.usersData,trackscount:this.trackscount})
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
            this.io.sockets.in(this.name).emit('updateuserlist', {users:this.usersData,trackscount:this.trackscount})
        }
        
    }

    resetPoints(endgame) {
        if(endgame) {
            for(let key in this.usersData) {
                this.usersData[key].points = 0
                this.usersData[key].matched = null
            }
        } else {
            for(let key in this.usersData) {
                this.usersData[key].matched = null
            }
        }
        
    }
    
    setRoomStatus(status){
        this.status = status;
        this.socket.emit('statusupdate', {status:this.status,timeleft:this.songtimeleft, previewUrl:this.previewUrl});
    }

    sendStatus(socket) {
        socket.emit('statusupdate', {status:this.status,timeleft:this.songtimeleft, previewUrl:this.previewUrl})
    }

    //track update logic
    songTimeLeft = (end, delay) => {
        this.songtimeleft = end - Date.now();
        if (this.songtimeleft < delay) {
            return;
        }
        setTimeout(this.songTimeLeft, delay, end, delay);
    }

    initiateCurrentTrack(response) {
        const songNumber = Math.round(Math.random() * 3) + 1
        this.artistName = response.results[songNumber].artistName
        this.trackName = response.results[songNumber].trackName
        this.previewUrl = response.results[songNumber].previewUrl
        this.artworkUrl = response.results[songNumber].artworkUrl100
    }

    getNewTrack() {
        try {
            request(getOptions(this.urls)).
                then(res => {
                    this.initiateCurrentTrack(res)
                    this.sendPlayTrack()                    
                })
        } catch (e) {
            this.getNewTrack()
        }
    }

    sendPlayTrack() {
        if(this.previewUrl==undefined) {
            this.getNewTrack()
            return
        }
        this.status = 0//Song is currently playing
        this.guessAllow = true;
        this.trackscount++
        console.log(this.trackscount)
        this.io.sockets.in(this.name).emit('playtrack', {trackUrl:this.previewUrl})
        this.songTimeLeft(Date.now()+30000, 50)
        setTimeout(this.sendTrackInfo.bind(this), 30000)
    }

    sendTrackInfo() {    
        this.io.sockets.in(this.name).emit('trackinfo', {
            artistName:this.artistName,
            trackName:this.trackName,
            artworkUrl:this.artworkUrl
        })
        this.resetPoints(false)
        if(this.trackscount<this.songsPerRound){
            this.status = 1//Loading next track
            this.io.sockets.in(this.name).emit('loadingnexttrack')
            this.guessAllow = false;
            setTimeout(() => this.getNewTrack(), 5000)          
        } else {
            this.gameOver()
        }
    }
    
    gameOver() {
        this.status = 3//the game is over
        this.io.sockets.in(this.name).emit('gameover', {users:this.usersData,trackscount:this.trackscount})
        this.trackscount = 0
        this.resetPoints(true)
        this.io.sockets.in(this.name).emit('updateuserlist', {users:this.usersData,trackscount:this.trackscount})
        setTimeout(() => this.getNewTrack(), 5000)
    }

    start() {
        this.urls = config.ids[this.name]
        setTimeout(() => this.getNewTrack(), 5000)
    }
}

module.exports = Room