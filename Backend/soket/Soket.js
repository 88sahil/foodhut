const server = require('../server')
const iofunc=(io)=>{
    let data=[]
    io.on("connection",(socket)=>{
    console.log(`user connected ${socket.id}`)
    
    socket.broadcast.emit("welcome",`welcome to the server ${socket.id}`)

    socket.on("chat",(payload)=>{
        console.log(socket.id);
        io.emit("chat",++payload)
    })
    socket.on('onlineUser',(payload)=>{
        console.log(`user connected:${socket.id}`)
    })
})
}


module.exports = {iofunc}