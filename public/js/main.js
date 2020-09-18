(function App() {
    const socket = io()

    const loginForm = document.querySelector('.login-form')
    const guessForm = document.querySelector('.guess-form')
    const modal = document.getElementById('modal')
    const userlist = document.getElementById('userlist')
    const feedback = document.querySelector('.feedback')
    const currentTrack = document.querySelector('.current-track')
    const playedTracks = document.getElementById('played-tracks')
    const modalResult = document.getElementById('modal-result')
    let audio
    console.log(roomName)

    let nickname
    
    
    socket.emit('joinroom', roomName)

    guessForm.addEventListener('submit', e => {
        e.preventDefault()
        guess(e.target.elements.guess.value)
        e.target.elements.guess.value = ''
    })

    guess = text => {
        if(text!='') {
            socket.emit('guess', {text:text})
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault()
        nickname = e.target.elements.nickname.value
        setNickname(nickname)
    })
    

    setNickname = nickname => {
        socket.emit('setnickname', {nickname:nickname})
    }

    invalidNickname = data => {
        feedback.innerHTML = data.feedback
    }
    
    socket.on('ready', data => {
        closeModal()
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
        showModalResult(usersData)
        playedTracks.innerHTML=""
        
    })

    showModalResult = (data) => {
        modalResult.innerHTML = ""
        modalResult.classList.add('bg-active')
        for(let userInfo in data.users){
            console.log(data.users[userInfo].nickname, data.users[userInfo].points)
        }
    }
    
    closeModal = () => {
        modal.classList.remove('bg-active')
        modal.style.display = 'none'
    }

    updateUserlist = data => {
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

    

    playTrack = url => {
        modalResult.classList.remove('bg-active')
        //currentTrack.innerHTML = `<video controls="" autoplay="" name="media"><source src="${url}" type="audio/x-m4a"></video>`
        audio = new Audio()
        audio.src = url
        audio.preload = 'auto'
        audio.play()
        audio.volume = 0.6
        console.log('here')
        
    }

    trackInfo = (artist, track) => {
        playedTracks.innerHTML += `<li>artist:${artist} track:${track}</li>`
    }
})()