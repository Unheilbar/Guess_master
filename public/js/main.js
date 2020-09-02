const socket = io()


// socket.on('message', message => {
//     console.log(message)
// })

const loginForm = document.querySelector('.login-form')

loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const nickname = e.target.elements.nickname.value
    setNickname(nickname)
    
    // e.preventDefault()
    // const nickname = e.target.elements.nickname.value
    // if(!nickname) {
    //     const p = document.createElement('p')
    //     p.innerHTML = 'invalid nickname'
    //     loginForm.appendChild(p)
    // } else {
    //     modalBg.classList.remove('bg-active')
    // }
})

function setNickname(nickname){
    socket.emit('setnickname', {nickname:nickname})
}

socket.on('ready', data => {
    console.log('congrats, u have been connected')
    console.log(`userlist: `)
    for(let user in data.users) {
        console.log(user)
    }
})