



(function App() {
    const socket = io()

    const loginForm = document.querySelector('.login-form')
    const modal = document.getElementById('modal')

    let nickname
    let users
    
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault()
        nickname = e.target.elements.nickname.value
        setNickname(nickname)
    })
    

    function setNickname(nickname){
        socket.emit('setnickname', {nickname:nickname})
    }
    
    socket.on('ready', data => {
        closeModal()
        users = data.users
        console.log(users)
    })
    
    closeModal = () => {
        modal.classList.remove('bg-active')
        modal.style.display = 'none'
    }

})()