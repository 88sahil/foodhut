const mongoose = require('mongoose')
const mongoclient = require('mongodb').MongoClient;
let dbname = "FoodHut"
const db = (process.env.DBString).replace("<password>",process.env.DBPASSWORD)
const connectMongo=()=>mongoose.connect(db).then((res)=>{
    console.log("successfully Connected")
}).catch((err)=>{
    console.log(err)
})
module.exports = {connectMongo}
