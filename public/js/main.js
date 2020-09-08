(function App() {
    const socket = io()

    const loginForm = document.querySelector('.login-form')
    const modal = document.getElementById('modal')
    const userlist = document.getElementById('userlist')
    const feedback = document.querySelector('.feedback')
    const currentTrack = document.querySelector('.current-track')
    const playedTracks = document.getElementById('played-tracks')
    console.log(playedTracks)

    let nickname
    let users
    
    
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
        console.log(usersData)
        playedTracks.innerHTML=""
    })
    
    closeModal = () => {
        modal.classList.remove('bg-active')
        modal.style.display = 'none'
    }

    updateUserlist = data => {
        userlist.innerHTML = ''
        for(let userInfo in data.users) {
            const username = data.users[userInfo].nickname
            userlist.innerHTML += `<li>${username}</li>`
        }
    }

    

    playTrack = url => {
        console.log(url)
        currentTrack.innerHTML = `<video controls="" autoplay="" name="media"><source src="${url}" type="audio/x-m4a"></video>`
        
    }

    trackInfo = (artist, track) => {
        playedTracks.innerHTML += `<li>artist:${artist} track:${track}</li>`
        console.log(artist, track)
    }


})()