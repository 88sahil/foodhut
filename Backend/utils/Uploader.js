const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name:process.env.cloud_name,
    api_key:process.env.api_key,
    api_secret:process.env.api_secret
})

const uploader = async(path)=>{
    try{
        if(!path){
            return null
        }
        let response = await cloudinary.uploader.upload(path,{
            resource_type:'auto',
            folder:'Photos'
        })
        return response
    }catch(err){
        console.log(err)
    }
}
const deletefile =async(id)=>{
    try{
        if(!id) return null;
        let response = await cloudinary.uploader.destroy(id)
        return response
    }catch(err){
        console.log(err)
    }
}
module.exports = {uploader,deletefile}