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
    finishline = 1

    //User logic
    addUser(socket) {
        this.sockets[socket.nickname] = socket
        this.usersData[socket.nickname] = {
			nickname:socket.nickname,
			points:0,
			roundpoints:0,
            matched:null,
            guesstime:0
        }

        socket.emit('ready', {users:this.usersData,trackscount:this.trackscount})
        socket.broadcast.to(this.name).emit('newuser', {nickname:socket.nickname,users:this.usersData})
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

    addPoints(nickname){
        this.usersData[nickname].guesstime = 30000 - this.songtimeleft
        switch (this.finishline) {
            case 1:
                this.finishline++
                this.usersData[nickname].roundpoints += 5
                this.usersData[nickname].points+=5
                break;
            case 2:
                this.finishline++
                this.usersData[nickname].roundpoints += 4
                this.usersData[nickname].points+=4
                break
            case 3:
                this.finishline++
                this.usersData[nickname].roundpoints += 3
                this.usersData[nickname].points += 3
                break
            default:
                this.usersData[nickname].roundpoints += 2
                this.usersData[nickname].points += 2            
        }
    }

    guess(text, socket) {
        console.log(this.artistName, " : ", this.trackName)
        let guesstime = 30000 - this.songtimeleft
        if(this.guessAllow) {
            if(!this.usersData[socket.nickname].matched) {
                if(match(text, this.artistName+' '+this.trackName)) {
                    this.usersData[socket.nickname].matched = 'both'
                    this.addPoints(socket.nickname)
                    this.io.sockets.in(this.name).emit('updateuserlist', {users:this.usersData, trackscount:this.trackscount})
                    return
                }
                if(match(text, this.artistName, 'artist')) {
                    this.usersData[socket.nickname].matched = 'artist'
                    this.usersData[socket.nickname].points += 1
                    this.usersData[socket.nickname].roundpoints += 1
                    this.usersData[socket.nickname].guesstime = guesstime
                }
                if(match(text, this.trackName)) {
                    this.usersData[socket.nickname].matched = 'track'
                    this.usersData[socket.nickname].points += 1
                    this.usersData[socket.nickname].roundpoints += 1
                    this.usersData[socket.nickname].guesstime = guesstime
                }
            }
            if(this.usersData[socket.nickname].matched == 'artist'){
                if(match(text, this.trackName)) {
                    this.usersData[socket.nickname].matched = 'both'
                    this.addPoints(socket.nickname)
                }
            }
            if(this.usersData[socket.nickname].matched == 'track'){
                if(match(text, this.artistName)) {
                    this.usersData[socket.nickname].matched = 'both'
                    this.addPoints(socket.nickname)
                }
            }
            this.io.sockets.in(this.name).emit('updateuserlist', {users:this.usersData, trackscount:this.trackscount})
        }
        
    }

    resetPoints(endgame) {
        if(endgame) {
            for(let key in this.usersData) {
                this.usersData[key].points = 0
                this.usersData[key].matched = null
                this.usersData[key].roundpoints = 0
                this.usersData[key].guesstime = 0
                this.finishline = 1
            }
        } else {
        for(let key in this.usersData) {
                this.usersData[key].matched = null
                this.usersData[key].roundpoints = 0
                this.usersData[key].guesstime = 0
                this.finishline = 1
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

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
    }

    initiateCurrentTrack(response) {
        const songNumber = this.getRandomInt(1, 6)
        this.artistName = response.results[songNumber].artistName
        this.trackName = response.results[songNumber].trackName
        this.previewUrl = response.results[songNumber].previewUrl
        this.artworkUrl = response.results[songNumber].artworkUrl100
        
        console.log(songNumber)
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
        this.trackscount++
        this.io.sockets.in(this.name).emit('updateuserlist', {users:this.usersData, trackscount:this.trackscount})
        //console.log(this.trackscount)
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
        this.trackscount = 0
        this.io.sockets.in(this.name).emit('gameover', {users:this.usersData,trackscount:this.trackscount})    
        this.resetPoints(true)
        this.io.sockets.in(this.name).emit('updateuserlist', {users:this.usersData, trackscount:this.trackscount})
        setTimeout(() => this.getNewTrack(), 10000)
    }

    start() {
        this.urls = config.ids[this.name]
        setTimeout(() => this.getNewTrack(), 5000)
    }
}

module.exports = Room