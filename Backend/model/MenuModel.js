const mongoose = require('mongoose')
const menuSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'menu should be name']
    },
    price:{
        type:Number,
        required:[true,'menu should have price']
    },
    isVeg:{
        type:Boolean,
        default:true
    },
    description:String,
    photo:String,
    photoid:String,
    customizable:{
        quantity:[{
            quantity:String,
            price:Number
        }],
        add:[{
            item:String,
            price:Number
        }]
    },
    restaurantId:{
        type:mongoose.Schema.ObjectId,
        ref:'restaurant'
    },
    isavailable:{
        type:Boolean,
        default:true
    },
    nextAvailable:Date
},{
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})

const Menu = mongoose.model("Menu",menuSchema)
module.exports = Menu