
import {Visualizer} from './visualizer.js'
function App() {
    // set Elements
    const socket = io()
    const visualizer = new Visualizer()
    const guessForm = document.querySelector('.guess-form')
    const userlist = document.getElementById('userlist')
    const roomStatus = document.getElementById('room__status')   
    const summaryInfo = document.querySelector('.summary')
    const currentRank = summaryInfo.querySelector('.rank')
    const currentPoints = summaryInfo.querySelector('.points')
    const currentTrackscount = summaryInfo.querySelector('.track')
    const lastArtist = document.getElementById('artist__name')
    const lastTrack = document.getElementById('track__name')
    const lastView = document.getElementById('track__view')
    const bmFeedback = document.getElementById('guess__feedback')
    let overModalContent

    let users = []

    let modalDrop
    let authModalContent
    let nickname = null

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

    const showOverModalDrop = () => {
        showModalDrop()
        overModalContent = document.createElement('div')
        let winnerContent = ''
        for(let user of users) {
            if(user){
                winnerContent+=`<li>${user.username} : ${user.points}</li>`
            }
        }
        overModalContent.innerHTML = 
            '<div class="modal__auth">'+
            '<div class="modal__header">'+
                'Раунд окончен.'+
            '</div>'+
            '<div class="modal__body">'+
                    `<ul>${winnerContent}</ul>`+
            '</div>'+
            '<div id="feedback">Следующий раунд скоро начнется</div>'+
            '</div>'
            document.body.appendChild(overModalContent)
            document.body.style.overflowY='none'
    }

    const closeOverModalDrop = () => {
        closeModalDrop()
        overModalContent.remove()
    }

    const authorization = () => {
        socket.emit('joinroom', roomName)
        showAuthModal()
        const login = document.getElementById('login')
        const button = document.getElementById('login-button')
        button.onclick = () => {
            nickname = login.value
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
        updateSummary(data)
        document.getElementById('guess').focus()
    }

    const setStatus = data => {         //0 Дождитесь окончания песни/1 - Загружается следующая песня/2 - Раунд скоро закончится!/3 - Новая игра скоро начнется!
        const status = data.status
        let statusContent
        switch (status){
            case 0:
                statusContent = 'Угадайте текущую песню'
                visualizer.playerAnimation(Date.now() + data.timeleft, false)
                break
            case 1:
                statusContent = 'Следующая песня загружается'
                break
            case 2:
                statusContent = 'Следующая песня скоро начнется'
                break
            case 3:
                statusContent = 'Дождитесь начала следующего раунда'
                break                
        }

        roomStatus.innerHTML = statusContent
    }

    authorization()

    const updateUserlist = data => {
        userlist.innerHTML = ''
        users = []
        for(let userInfo in data.users) {
            const username = data.users[userInfo].nickname
            const points = data.users[userInfo].points
            const roundpoints = data.users[userInfo].roundpoints
            const guesstime = data.users[userInfo].guesstime
            users.push({
                username:username,
                points:points,
                roundpoints:roundpoints,
                guesstime:guesstime
            })
            
        }
        users.sort(function(a, b) {return b.points - a.points})
        for(let user of users){
            let addition = ''
            if(user.roundpoints){
                addition+=`<span style="color:rgb(132, 220, 255)"> +${user.roundpoints}</span>`
            }
            if(user.guesstime) {
                addition += `<span style="color:rgb(44, 152, 185, 0.9); font-size:10px;"> ${(user.guesstime/1000).toFixed(2)} сек</span>`
            }
            userlist.innerHTML += `<li>${user.username}  (${user.points})${addition}</li>`
        }
    }

    const updateSummary = data => {        //Displays user statistics(rank, trackscount, points)
        let points = data.users[nickname].points
        let trackscount = data.trackscount+1+'/15'
        let rank = users.findIndex(user => user.username == nickname)+1
        currentRank.innerHTML = rank
        currentTrackscount.innerHTML = trackscount
        currentPoints.innerHTML = points      
    }

    const trackInfo = data => {
        lastArtist.innerHTML = data.artistName
        if(data.trackName.length > 30) {
            lastTrack.innerHTML = data.trackName.substring(0,30) + '...'
        } else {
            lastTrack.innerHTML = data.trackName
        }
        lastView.setAttribute('src', data.artworkUrl)
    }

    const guessFeedback = feedback => {
        bmFeedback.innerHTML = feedback
    }

    const gameOver = (data) => {
        updateUserlist(data)
        showOverModalDrop()
        setTimeout(() => closeOverModalDrop(), 10000)
    }

    //Socket handlers:
    socket.on('updateuserlist', data => {
        updateUserlist(data)
        updateSummary(data)
    })

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

    socket.on('playtrack', data => {
        getRoomStatus()
        visualizer.setNewTrack(data.trackUrl)
    })

    socket.on('loadingnextntrack', () => {
        getRoomStatus()
        visualizer.setLoadingStatus(Date.now())
    })

    socket.on('trackinfo', data => {
        getRoomStatus()
        trackInfo(data)
    })

    socket.on('gameover', data => {
        getRoomStatus()
        gameOver(data)
    })

    socket.on('bmphrase', data => {
        guessFeedback(data)
    })
}



 App()   


















//     let users
    
//     socket.emit('joinroom', roomName)





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