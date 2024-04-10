const User = require('../model/UserMdel')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/Error')
const {promisify} = require('util')
const Email = require('../utils/Email')
const crypto = require('crypto')
const {uploader,deletefile} = require('../utils/Uploader')
const fs =require('fs')
const {checkasync} = require('../utils/checkasync')
module.exports.filterObj=(reqobj,...fields)=>{
    let newObj ={};
    for(let ele in reqobj){
        if(fields.includes(ele)){
            newObj[ele] = reqobj[ele]
        }
    }
    return newObj
}
const createSignInToken=(res,user,status)=>{
    let token = jwttoken(user)
    const cookieOption={
        expires:new Date(Date.now()+30*24*60*60*1000),
        httpOnly:true
    }
    res.cookie("jwt",token,cookieOption)
    res.status(status).json({
        status:'success',
        user
    })
}
const jwttoken = (user)=>{
    return jwt.sign({id:user._id},process.env.jwtsecret,{
        expiresIn:'30d'  
    })
}
module.exports.createuser = checkasync(async(req,res,next)=>{
    const user = await User.create(req.body)
    createSignInToken(res,user,201)
})
module.exports.SignInUser = checkasync(async(req,res,next)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return next(new AppError("please enter sufficient data",400))
    }
    const user = await User.findOne({email}).select('+password')
    if(!user){
        return next(new AppError('no user available with this email please try again',404))
    }
    if(!await user.comparepassword(password,user.password)){
        return next(new AppError("invalid password or email",401))
    }
    createSignInToken(res,user,200);

})
module.exports.protected = checkasync(async(req,res,next)=>{
    let jwttoken = req.headers.cookie.split('=')[1]
    if(!jwttoken){
        return next(new AppError("no token available"))
    }

    let decoded = await promisify (jwt.verify)(jwttoken,process.env.jwtsecret);
    if(decoded.exp*1000<Date.now()){
        return next( new AppError("session expired",401))
    }
    let user = await User.findById(decoded.id);
    if(user.isPasswordChange(decoded.iat)){
        return next(new AppError("password changed please login again",401))
    }
    req.user = user;
    next()
})

module.exports.verify = checkasync((req,res,next)=>{
    res.status(200).json({
        status:'success',
        user:req.user
    })
})
module.exports.updatepassword = checkasync(async(req,res,next)=>{
    const {oldpassword,newpassword,conformnewpassword} = req.body;
    let user = await User.findById(req.user._id).select('+password')
    if(!user){
        return next(new AppError("no user found please login",401));
    }
    const ispasstrue = await user.comparepassword(oldpassword,user.password)
    console.log(ispasstrue)
    if(!ispasstrue){
        return next(new AppError("password did't match please try again",400))
    }
    user.password = newpassword
    user.conformpassword = conformnewpassword
    user.passwordChangedAt = Date.now()
    await user.save()

    res.status(200).json({
        status:'success',
        message:'password changed successfully',
        user
    })
})


module.exports.Forgotpassword = checkasync(async(req,res,next)=>{
    const {email} = req.body
    if(!email){
        return next(new AppError('please enter email',400))
    }
    let user = await User.findOne({email});
    let String  = await user.generateResetString()
    let url = `http://locolhost:8000/resetlink/${String}`;
    const sendEmail = await new Email(user,url).sendLink();
    res.status(200).json({
        status:'success',
        message:'email sent successFully',
    })
})

module.exports.changepassword = checkasync(async(req,res,next)=>{
    const string = req.params.string
    const {newpassword,conformnewpassword} = req.body
    if(!string || !newpassword || !conformnewpassword){
        return next(new AppError('data not available',400))
    }
    let finalString = crypto.createHash('sha256').update(string).digest('hex')
    let user = await User.findOne({passwordresetString:finalString})
    if(new Date(Date.now())>user.passwordtokenexpiresAt){
        return next(new AppError('password changed link expires',401))
    }
    if(!user){
        return next(new AppError('user not available',404))
    }
    user.password = newpassword;
    user.conformpassword = conformnewpassword
    user.passwordChangedAt = Date.now()
    user.passwordresetString = undefined
    user.passwordtokenexpiresAt = undefined

    await user.save()

    createSignInToken(res,user,200)
})

module.exports.updateMe=checkasync(async(req,res,next)=>{
    const reqobj = this.filterObj(req.body,'username','photo','photoid','role','location','name')
    let user  = await User.findByIdAndUpdate(req.user._id,{...reqobj},{new:true})
    if(!user){
        return next(new AppError('faild to update user',500))
    }
    res.status(200).json({
        status:'success',
        message:'successfully updated',
        user
    })
})
module.exports.deleteUser = checkasync(async(req,res,next)=>{
    const id = req.params.id;
    if(req.user.role ==='user'){
        if(req.user._id!==id){
            return next(new AppError('you cant delete this account',401))
        }
    }
    let user = await User.findByIdAndUpdate(id,{isActive:false},{new:true})
    if(!user){
        return next(new AppError('fail to delete',500))
    }
    res.cookie('jwt',"",{
        expires:new Date(Date.now())
    })
    res.status(200).json({
        status:'success',
        message:'successfully deleted'
    })
})
module.exports.restricatedTo = (...roles)=>{
        return (req,res,next)=>{
            if(!roles.includes(req.user.role)){
                return next(new AppError('you have not permisson for this',401))
            }
            next()
            }
        }
module.exports.uploadProfile = checkasync(async(req,res,next)=>{
            const path = req.file.path
            let user = await User.findById(req.user._id)
            if(user.photoid){
                await deletefile(user.photoid)
            }
            if(!user){
                return next(new AppError("no user found!",404))
            }
            let response = await uploader(path)
            if(!response){
                return next(new AppError("fail to upload",500))
            }
            user.photo = response.url
            user.photoid = response.public_id
            await user.save()
            fs.unlinkSync(path)
            res.status(200).json({
                user
            })
})   
module.exports.addTocart = checkasync(async(req,res,next)=>{
    const user = await User.findById(req.user._id)
    const cartid = req.body.id;
    console.log(cartid)
    if(!user){
        return next(new AppError("no user available",404))
    }
    let cart = user.cart.items
    console.log(cart)
    let item = cart.find((ele)=>{
        if(ele.dish===null)ele.dish?.equals(cartid) || null})
    if(item){
        item.quantity += 1;
    }else{
        cart.push({dish:cartid,quantity:1})
    }
    user.cart.items = cart
    await user.save()
    res.status(200).json({
        user
    })
})
module.exports.removefromcart = checkasync(async(req,res,next)=>{
    let user = await User.findById(req.user._id)
    let itemid = req.body.id
    let cart = user.cart.items
    let item = cart.find((ele)=>ele.dish.equals(itemid))
        if(item.quantity>1){
            item.quantity -= 1
        }else{
            cart.pull(item)
        }
    user.cart.items=cart
    await user.save()
    res.status(200).json({
        user
    })
})

module.exports.logout = checkasync((req,res,next)=>{
    res.cookie("jwt","",{
        expires:new Date(Date.now()-10)
    })
    res.status(200).json({
        message:'successfully loggedout'
    })
})

