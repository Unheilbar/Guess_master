const artistids = require('../utils/artist-ids')
const request = require('request-promise')

class Room {
    constructor(name) {
        this.name = name
    }

    userList = []
    sockets = { }
    usersData = { }
    trackscount = 0

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
            const feedback = "Nickname should containt less than 10 characters"
            return this.invalidNickname(socket, feedback)
        }
        
        socket.nickname = data.nickname

        this.addUser(socket)
        socket.emit('ready', {users:this.usersData,trackscount:this.trackscount})
    }

    userLeft(socket) {
        if(socket.nickname != undefined) {
            this.removeUser(socket)
            console.log(`user ${socket.nickname} has been removed`)
        }
    }

    invalidNickname(socket, feedback) {
        socket.emit('invalidnickname', {feedback:feedback})
    }

    // ids = artistids

    // generateUri() {
    //     let rand = Math.random() * (this.ids.length - 0.5)
    //     let uri = 'https://itunes.apple.com/lookup?id=' + this.ids[Math.round(rand)] + '&entity=song&limit=5&sort=recent'
    //     this.currentUri = uri
    // }

    // getNewTrack() {
    //     this.generateUri()
    //     const options = {
    //         method: 'Get',
    //         uri: this.currentUri,
    //         json: true
    //     }

    //     console.log(this.currentUri)
    //     try {
    //         request(options).
    //             then(res => {
    //                 this.initiateCurrentTrack(res)
    //                 this.showRes()
    //             })
    //     } catch (e) {
    //         getNewTrack()
    //     }

    // }


    // initiateCurrentTrack(response) {
    //     const songNumber = Math.round(Math.random() * 3) + 1
    //     console.log(songNumber)
    //     this.artistName = response.results[songNumber].artistName
    //     this.trackName = response.results[songNumber].trackName
    // }

    // showRes() {
    //     setTimeout(() => {
    //         this.songPlayed++
    //         console.log(this.artistName, this.trackName)
    //         this.getNewTrack()
    //     }
    //         , 5000)

    // }
}

module.exports = Room