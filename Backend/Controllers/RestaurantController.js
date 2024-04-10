const {checkasync} = require('../utils/checkasync')
const Restaurant = require('../model/RestaurantModel')
const AppError = require('../utils/Error')
const {filterObj} = require('./UserController')
const apifeatures = require('../utils/apifeatures')
const {uploader,deletefile} = require('../utils/Uploader')
const Menu = require('../model/MenuModel')
const {deletemenuWithRest} = require('./MenuController')
module.exports.createRestaurant = checkasync(async(req,res,next)=>{
    const data = req.body
    data.owner = req.user._id
    let restaurant = await Restaurant.create(data)
    if(!restaurant){
        return next(new AppError("fail to create",500))
    }
    res.status(200).json({
        status:'success',
        message:'restaurant created successfully. wait untill our team verify it'
    })
})

module.exports.findrestaurant = checkasync(async(req,res,next)=>{
    let apifeture = new apifeatures(Restaurant,req.query).filer().sort().paginate()
    let restautant = await apifeture.Model.find({verified:{$ne:false}})
    res.status(200).json({
        status:'success',
        result:restautant.length,
        restautant
    })
})
module.exports.getRestaurant = checkasync(async(req,res,next)=>{
    const id = req.params.id
    let rest = await Restaurant.findById(id).populate('Menu')
    if(!rest){
        return next(new AppError("can't find this restaurant",404))
    }
    res.status(200).json({
        status:'success',
        result:1,
        rest
    })
})
module.exports.getMyrestaurant = checkasync(async(req,res,next)=>{
    let restaurant = await Restaurant.find({owner:req.user._id}).populate('Menu')
    res.status(200).json({
        status:'success',
        results:restaurant.length,
        restaurant
    })
})
module.exports.verfiyRestaurant = checkasync(async(req,res,next)=>{
    const id = req.params.id
    let rest = await Restaurant.findByIdAndUpdate(id,{verified:true},{new:true})
    res.status(200).json({
        status:'success',
        message:`${rest.name} verfied successfully`
    })
})
module.exports.updateRestaurant =  checkasync(async(req,res,next)=>{
    const updated = req.body
    let filteob = filterObj(req.body,'name','location','category','isopen','nextopentime')
    console.log(filteob)
    let rest  = await Restaurant.findByIdAndUpdate(req.params.id,filteob,{new:true})
    res.status(200).json({
        rest
    })
})
module.exports.uploadcoverphoto = checkasync(async(req,res,next)=>{
    const id = req.params.id
    let restaurnt = await Restaurant.findById(id)
    if(!restaurnt){
        return next(new AppError("no restaurant available",404))
    }
    if(restaurnt.photoid){
        await deletefile(restaurnt.photoid)
    }
    let response = await uploader(req.file.path)
    if(!response){
        return next(new AppError('fail to upload photo',500))
    }
    restaurnt.photo = response.url
    restaurnt.photoid = response.public_id
    await restaurnt.save()
    require('fs').unlinkSync(req.file.path)
    res.status(200).json({
        status:'success',
        message:'photo successfully uploaded',
        restaurnt
    })
})
module.exports.deleteRestaurant = checkasync(async(req,res,next)=>{
    let restaurant = await Restaurant.findById(req.params.id)
    if(!restaurant){
        return next(new AppError('no restaurant available',404))
    }
    let name = restaurant.name
    if(req.user.role !== "admin"||!req.user._id.equals(restaurant.owner._id) ){
        return next(new AppError("you don't have permisson to do this"))
    }
    if(restaurant.photoid){
        await deletefile(restaurant.photoid)
    }
    await deletemenuWithRest(restaurant._id)
    await restaurant.deleteOne()
    res.status(200).json({
        status:'success',
        message:`${name} successfully deleted`
    })
})