
import {Visualizer} from './visualizer.js'
(function App() {
    const socket = io()
    const visualizer = new Visualizer()
    const guessForm = document.querySelector('.guess-form')
    const userlist = document.getElementById('userlist')
    const feedback = document.querySelector('.feedback')
    const playedTracks = document.getElementById('played-tracks')
    const authModal = document.querySelector('modal__auth')
    let users
    
    socket.emit('joinroom', roomName)

    guessForm.addEventListener('submit', e => {
        e.preventDefault()
        guess(e.target.elements.guess.value)
        e.target.elements.guess.value = ''
    })

    const guess = text => {
        if(text!='') {
            socket.emit('guess', {text:text})
        }
    }

    const setNickname = nickname => {
        socket.emit('setnickname', {nickname:nickname})
    }

    const invalidNickname = data => {
        feedback.innerHTML = data.feedback
    }
    
    socket.on('ready', data => {
        users = data.users
        updateUserlist(data)
    })

    socket.on('updateuserlist', data => {
        updateUserlist(data)
    })

    socket.on('invalidnickname', data => {
        invalidNickname(data)
    })

    socket.on('playtrack', data => {
        playTrack(data.trackUrl)
    })

    socket.on('trackinfo', data => {
        trackInfo(data.artistName, data.trackName)
    })

    socket.on('gameover', usersData => {
        updateUserlist(usersData)
        playedTracks.innerHTML=""
        
    })

    const updateUserlist = data => {
        userlist.innerHTML = ''
        const users = []
        for(let userInfo in data.users) {
            const username = data.users[userInfo].nickname
            const points = data.users[userInfo].points
            users.push({
                username:username,
                points:points
            })
            
        }
        users.sort(function(a, b) {return b.points - a.points})
        for(let user of users){
            userlist.innerHTML += `<li>${user.username}  ${user.points}</li>`
        }
    }

    const playTrack = url => {
        visualizer.setNewTrack(url)
    }

    const trackInfo = (artist, track) => {
        playedTracks.innerHTML += `<li>artist:${artist} track:${track}</li>`
    }

    const authorization = () => {
        document.body.style.overflowY='none'
        const login = document.getElementById('login')
        const button = document.getElementById('login-button')
        button.onclick = () => {
            const nickname = login.value
            setNickname(nickname.trim())
        }
        login.addEventListener('keyup', e => {
            if(e.key == 'Enter'){
                button.click()
            }
        })
    }

    authorization()
})()