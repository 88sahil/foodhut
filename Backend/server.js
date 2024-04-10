require('dotenv').config()
const express = require('express')
const App = express()
const server = require('http').createServer(App)
const {iofunc} = require('./soket/Soket')
const cors = require('cors')
const {connectMongo} = require('./DB/Db')
const GlobalErrorHandle = require('./utils/GlobalErrorHandle')
const UserRoute = require('./Routes/UserRoutes')
const RestaurantRoute = require('./Routes/RestaurantRoute')
const MenuRoute = require('./Routes/MenuRoute')
const io = require('socket.io')(server,{
    cors:{
        origin:'*',
        Credential:true
    }
})
App.use(cors({
    credentials:true
}))
connectMongo()
iofunc(io)

App.use(express.json())
App.use('/api/user',UserRoute)
App.use('/api/restaurant',RestaurantRoute)
App.use('/api/Menu',MenuRoute)
App.use(GlobalErrorHandle)
const port = process.env.PORT || 3000
server.listen(port,()=>{
    console.log(`hello from port http://localhost:${port}`)
})

module.exports = server