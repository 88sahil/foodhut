const {checkasync} = require('../utils/checkasync')
const Menu = require('../model/MenuModel')
const AppError = require('../utils/Error')
const {filterObj} = require('../Controllers/UserController')
const {uploader,deletefile} = require('../utils/Uploader')

module.exports.createMenu = checkasync(async(req,res,next)=>{
    const restid = req.params.restId
    const data = req.body
    data.restaurantId = restid
    let menu= await Menu.create(data)
    if(!menu){
        return next(new AppError('fail to create',500))
    }
    res.status(201).json({
        status:'success',
        message:`${menu.name} added successfully`
    })
})


module.exports.updatemenu = checkasync(async(req,res,next)=>{
    const MenuID = req.params.menuId
    const reqobj = req.body
    let data = filterObj(reqobj,"name","description","price","isVeg","customizable","isavailable","nextAvailable")
    let menu = await Menu.findByIdAndUpdate(MenuID,data,{new:true})
    if(!menu){
        return next(new AppError("fail to update",500))
    }
    res.status(200).json({
        status:'success',
        message:`${menu.name} updated successfully`
    })
})
module.exports.addPhoto = checkasync(async(req,res,next)=>{
    const menu = await Menu.findById(req.params.menuId)
    if(!menu){
        return next(new AppError("can't able to fine this menu",400))
    }
    if(menu.photoid){
        await deletefile(menu.photoid)
    }
    let response = await uploader(req.file.path)
    if(!response){
        return next(new AppError("faild to upload file",500))
    }
    menu.photo = response.url
    menu.photoid = response.public_id
    await menu.save()
    require('fs').unlinkSync(req.file.path)
    res.status(200).json({
        status:"success",
        message:'successfully uploaded'
    })
})
module.exports.deletemenu=checkasync(async(req,res,next)=>{
    const menu_id = req.params.menuId
    let menu = await Menu.findById(menu_id)
    let name = menu.name
    if(!menu){
        return next(new AppError("no menu avalable with this id",404))
    }
    if(menu.photoid){
        await deletefile(menu.photoid)
    }
    let del=await menu.deleteOne()
    if(!del){
        return next(new AppError('error in delete menu'),500)
    }
    res.status(200).json({
        status:'success',
        message:`${name} deleted successfully`
    })
})
module.exports.deletemenuWithRest=async(id)=>{
    let menus = await Menu.find({restaurantId:id})
    for(let ele of menus){
        if(ele.photoid){
            await deletefile(ele.photoid)
        }
    }
    await Menu.deleteMany({restaurantId:id})
}
module.exports.addQuantitycust = checkasync(async(req,res,next)=>{
    let data = req.body
    let menu = await Menu.findById(req.params.menuId)
    if(!menu){
        return next(new AppError("can't find this menu",404))
    }
    menu.customizable.quantity.push(data)
    await menu.save()
    res.status(200).json({
        status:'success',
        message:'added successfully'
    })
})
module.exports.deletequantity =checkasync(async(req,res,next)=>{
    let menu = await Menu.findById(req.params.menuId)
    if(!menu){
        return next(new AppError("Menu not available with this id",404))
    }
    let quantitycust = req.body.id
    let addon = menu.customizable.add.find((ele)=>ele._id.equals(quantitycust)) 
    if(!addon){
        return next(new AppError("this addon not available",404))
    }
    menu.customizable.quantity.pull(addon)
    await menu.save()
    res.status(200).json({
        status:'success',
        message:'deleted successfully'
    })
})
module.exports.addoncust = checkasync(async(req,res,next)=>{
    let data = req.body
    let menu = await Menu.findById(req.params.menuId)
    if(!menu){
        return next(new AppError("can't find this menu",404))
    }
    menu.customizable.add.push(data)
    await menu.save()
    res.status(200).json({
        status:'success',
        message:'added successfully'
    })
})
module.exports.deleteaddon =checkasync(async(req,res,next)=>{
    let menu = await Menu.findById(req.params.menuId)
    if(!menu){
        return next(new AppError("Menu not available with this id",404))
    }
    let quantitycust = req.body.id
    let addon = menu.customizable.add.find((ele)=>ele._id.equals(quantitycust)) 
    if(!addon){
        return next(new AppError("this addon not available",404))
    }
    menu.customizable.add.pull(addon)
    await menu.save()
    res.status(200).json({
        status:'success',
        message:'deleted successfully'
    })
})
