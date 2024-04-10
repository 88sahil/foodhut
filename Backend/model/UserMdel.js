const mongoose = require('mongoose')
const validator = require('validator')
const bycrypt = require('bcrypt')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:[true,'user must have name']
    },
    username:{
        type:String,
        require:[true,'user name must required']
    },
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("this is not email")
            }
        }
    },
    password:{
        type:String,
        require:[true,'please enter password'],
        select:false
    },
    conformpassword:{
        type:String,
        validate:{
            validator:function(el){
                    return this.password===el;
                },
            message:'please enter same password'
        }
    },
    photo:String,
    photoid:String,
    location:{
        point:{
            type:String,
            default:"Point"
        },
        coordinates:{
            type:[Number]
        },
        address:String,
        City:String
    },
    role:{
        type:String,
        default:'user',
        enum:['user','delivery-person','r-owner','city-office','admin']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    passwordChangedAt:{
        type:Date
    },
    passwordtokenexpiresAt:Date,
    isActive:{
        type:Boolean,
        default:true
    },  
    passwordresetString:String,
    cart:{
        totalprice:{
            type:Number,
            default:0
        },
        items:[{
            dish:{
                type:mongoose.Schema.ObjectId,
                ref:'Menu'//have to modify to mongoose id
            },
            quantity:{
                type:Number,
                default:1
            }
        }]
    },

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

userSchema.index({username:1},{unique:true});
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bycrypt.hash(this.password,12)
    this.conformpassword=undefined
    next()
})
userSchema.pre(/^find/,function(next){
    this.find({isActive:{$ne:false}})
    next()
})
userSchema.methods.comparepassword = async(candidatePassword,origialpassword)=>{
    let istrue = await bycrypt.compare(candidatePassword,origialpassword)
    return istrue
}
userSchema.methods.isPasswordChange = function(timestamp){
    return new Date(timestamp*1000)<this.passwordChangedAt
}
userSchema.methods.generateResetString=async function(next){
    let resetString = crypto.randomBytes(32).toString('hex')
    let finalString = crypto.createHash('sha256').update(resetString).digest('hex')
    this.passwordresetString = finalString
    this.passwordtokenexpiresAt = Date.now()+5*60*1000;
    await this.save()
    return resetString
}
userSchema.pre(/^find/,function(next){
    this.populate({
        path:'cart.items.dish',
        select:"name photo price isVeg"
    })
    next()
})
const User = mongoose.model('AllUser',userSchema)

module.exports = User