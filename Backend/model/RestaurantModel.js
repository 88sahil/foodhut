const mongoose = require('mongoose')
const restaurantSchema =  new mongoose.Schema({
    name:{
        type:String,
        required:['true','restautant must have name']
    },
    location:{
        city:{
            type:String
        },
        coordinates:{
            type:[Number]
        },
        address:{
            type:String
        }
    },
    ratingaverage:{
        type:Number,
        default:0
    },
    ratingquantity:{
        type:Number,
        default:0,
    },
    photo:String,
    photoid:String,
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:'AllUser'
    },
    verified:{
        type:Boolean,
        default:false
    },
    isopen:{
        type:Boolean,
        default:true
    },
    nextopentime:Date,
    restauranttype:{
        type:String,
        enum:['veg','nonveg','both']
    },
    category:[String],
    offers:[{
        offerId:String
    }],
    fssaiNumber:{
        type:String,
        require:[true,'must enter fssai number']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
},{
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})
restaurantSchema.index({fssaiNumber:1},{unique:true})
restaurantSchema.pre(/^find/,function(next){
    this.populate({
        path:'owner',
        select:'name email photo'
    })
    next()
})
restaurantSchema.virtual('Menu',{
    ref:'Menu',
    foreignField:'restaurantId',
    localField:'_id'
})
const Restaurant = mongoose.model("restaurant",restaurantSchema)

module.exports = Restaurant