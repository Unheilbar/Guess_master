const socket = io()

const list = document.getElementsByTagName('ul')[0]


socket.on('message', message => {
    console.log(message)
})

socket.on('freak', zalupa => {
    let newLi = document.createElement('li')
    newLi.innerHTML = zalupa.name
    list.append(newLi)
})