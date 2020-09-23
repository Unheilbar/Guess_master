
import {Visualizer} from './visualizer.js'
function App() {
    // set Elements
    const socket = io()
    const visualizer = new Visualizer()
    const guessForm = document.querySelector('.guess-form')
    const userlist = document.getElementById('userlist')
    const roomStatus = document.getElementById('room__status')   
    const playedTracks = document.getElementById('played-tracks')

    let modalDrop
    let authModalContent

    //DOM manipulations
    const showAuthModal = () => {
        showModalDrop()
        authModalContent = document.createElement('div')
        authModalContent.innerHTML = 
            '<div class="modal__drop"></div>'+
            '<div class="modal__auth">'+
            '<div class="modal__header">'+
                'Вы зашли в комнату гениев'+
            '</div>'+
            ' <div class="modal__body">'+
                    'Введите никнейм'+
                '</div>'+
            '<div class="modal__footer">'+
            '<input type="text" class="input__nickname" id="login" maxlength="14" autofocus>'+
            '<button class="submit__nickname-button" id="login-button">Войти</button>'+
            '</div>'+
            '<div id="feedback"></div>'+
            '</div>'
        document.body.appendChild(authModalContent)
        document.body.style.overflowY='none'
    }

    const closeAuthModal = () => {
        authModalContent.remove()
    }

    const showModalDrop = () => {
        modalDrop = document.createElement('div')        
        modalDrop.classList.add('modal__drop')
        document.body.appendChild(modalDrop)
    }

    const closeModalDrop = () => {
        modalDrop.remove()
    }

    const authorization = () => {
        socket.emit('joinroom', roomName)
        showAuthModal()
        const login = document.getElementById('login')
        const button = document.getElementById('login-button')
        button.onclick = () => {
            const nickname = login.value
            const data = {
                roomname:roomName,
                nickname:nickname
            }
            setNickname(data)
        }
        login.addEventListener('keyup', e => {
            e.preventDefault()
            if(e.key == 'Enter'){
                button.click()
            }
        })
    }

    const getRoomStatus = () => {
        socket.emit('getstatus')
    }
  
    const setNickname = data => {
        socket.emit('setnickname', data)
    }

    const userJoin = data => {
        updateUserlist(data)
    }

    const userLeft = data => {
        updateUserlist(data)
    }

    const ready = data => {     //getting usersData, trackscount, roomstatus
        getRoomStatus()
        updateUserlist(data)
        updateSummary(data.trackscount)
    }

    const setStatus = data => {         //0 Дождитесь окончания песни/1 - Загружается следующая песня/2 - Раунд скоро закончится!/3 - Новая игра скоро начнется!
        console.log(`roomStatus: ${data.status}, songtimeleft: ${data.timeleft}`)
    }

    authorization()

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

    const updateSummary = trackscount => {        //Displays user statistics(rank, trackscount, points)
        console.log(`trackscount: ${trackscount}`)
    }

    //Socket handlers:
    socket.on('invalidnickname', data => {
        const feedback = document.getElementById('feedback')
        feedback.innerHTML = data.feedback
    })
    
    socket.on('newuser', data => {
        userJoin(data)
    })

    socket.on('userleft', data => {
        userLeft(data)
    })

    socket.on('ready', data => {
        closeModalDrop()
        closeAuthModal()
        ready(data)
    })

    socket.on('statusupdate', data => {
        setStatus(data)
    })

}



 App()   


















//     let users
    
//     socket.emit('joinroom', roomName)

//     guessForm.addEventListener('submit', e => {
//         e.preventDefault()
//         guess(e.target.elements.guess.value)
//         e.target.elements.guess.value = ''
//     })

//     const guess = text => {
//         if(text!='') {
//             socket.emit('guess', text)
//         }
//     }



//     const invalidNickname = data => {
//         const feedback = document.querySelector('.feedback')
//         feedback.innerHTML = data.feedback
//     }
    
//     socket.on('ready', data => {        
//         users = data.users
//         console.log(users)
//         updateUserlist(data)
//         roomStatus.innerHTML = 'Дождитесь окончания текущего трека!'
//         closeAuthModal()
//     })

//     socket.on('updateuserlist', data => {
//         updateUserlist(data)
//     })

//     socket.on('invalidnickname', data => {
//         invalidNickname(data)
//     })

//     socket.on('playtrack', data => {
//         visualizer.setNewTrack(data.trackUrl)
//     })

//     socket.on('trackinfo', data => {
//         trackInfo(data.artistName, data.trackName)
//     })



//     socket.on('statusupdate', status => {
//         switch (status) {
//             case 0:
//                 roomStatus.innerHTML = 'Что это за трек?'
//                 break
//             case 1:
//                 roomStatus.innerHTML = 'Загружается следующий трек'
//                 break
//             case 3:
//                 roomStatus.innerHTML = 'Начинаем следующий раунд...'
//                 break
//         }
//     }) 
        
    

//     socket.on('gameover', usersData => {
//         updateUserlist(usersData)
//         playedTracks.innerHTML=""
//     })



//     const trackInfo = (artist, track) => {
//         playedTracks.innerHTML += `<li>artist:${artist} track:${track}</li>`
//     }

//     const authorization = () => {
//         //document.body.innerHTML+=
        
//         document.body.style.overflowY='none'
//         const login = document.getElementById('login')
//         const button = document.getElementById('login-button')
//         button.onclick = () => {
//             const nickname = login.value
//             setNickname(nickname.trim())
//         }
//         login.addEventListener('keyup', e => {
//             if(e.key == 'Enter'){
//                 button.click()
//             }
//         })
//     }

//     const closeAuthModal = () => {
//         document.querySelector('.modal__auth').remove()
//         document.querySelector('.modal__drop').remove()
//     }

//     authorization()
// })()