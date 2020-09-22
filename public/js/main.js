
import {Visualizer} from './visualizer.js'
(function App() {
    const socket = io()
    const visualizer = new Visualizer()
    const guessForm = document.querySelector('.guess-form')
    const userlist = document.getElementById('userlist')
    const roomStatus = document.getElementById('room__status')
    
    const playedTracks = document.getElementById('played-tracks')

    let users
    
    socket.emit('joinroom', roomName)

    guessForm.addEventListener('submit', e => {
        e.preventDefault()
        guess(e.target.elements.guess.value)
        e.target.elements.guess.value = ''
    })

    const guess = text => {
        if(text!='') {
            socket.emit('guess', text)
        }
    }

    const setNickname = nickname => {
        socket.emit('setnickname', {nickname:nickname})
    }

    const invalidNickname = data => {
        const feedback = document.querySelector('.feedback')
        feedback.innerHTML = data.feedback
    }
    
    socket.on('ready', data => {        
        users = data.users
        console.log(users)
        updateUserlist(data)
        roomStatus.innerHTML = 'Дождитесь окончания текущего трека!'
        closeAuthModal()
    })

    socket.on('updateuserlist', data => {
        updateUserlist(data)
    })

    socket.on('invalidnickname', data => {
        invalidNickname(data)
    })

    socket.on('playtrack', data => {
        visualizer.setNewTrack(data.trackUrl)
    })

    socket.on('trackinfo', data => {
        trackInfo(data.artistName, data.trackName)
    })



    socket.on('statusupdate', status => {
        switch (status) {
            case 0:
                roomStatus.innerHTML = 'Что это за трек?'
                break
            case 1:
                roomStatus.innerHTML = 'Загружается следующий трек'
                break
            case 3:
                roomStatus.innerHTML = 'Начинаем следующий раунд...'
                break
        }
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

    const trackInfo = (artist, track) => {
        playedTracks.innerHTML += `<li>artist:${artist} track:${track}</li>`
    }

    const authorization = () => {
        //document.body.innerHTML+=
    //     ('<div class="modal__drop"></div>'+
    //         '<div class="modal__auth">'+
    //         '<div class="modal__header">'+
    //             'Вы зашли в комнату гениев'+
    //         '</div>'+
    //         ' <div class="modal__body">'+
    //                 'Введите никнейм'+
    //             '</div>'+
    //         '<div class="modal__footer">'+
    //     '<input type="text" class="input__nickname" id="login" maxlength="14" autofocus>'+
    //     '<button class="submit__nickname-button" id="login-button">Войти</button>'+
    // '</div>'+
    // '<p class="feedback"></p>'+
    // '</div>')
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

    const closeAuthModal = () => {
        document.querySelector('.modal__auth').remove()
        document.querySelector('.modal__drop').remove()
    }

    authorization()
})()