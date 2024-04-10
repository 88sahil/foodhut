const handeldevError =(err,res)=>{
    res.status(err.statuscode).json({
        status:err.status,
        message:err.message,
        stack:err
    })
}


const GlobalErrorHandle =  (err,req,res,next)=>{
        err.statuscode = err.statuscode ||400;
        err.status = err.status || 'fail'

        if(process.env.NODE_ENV==="developer"){
            handeldevError(err,res);
        }
}

module.exports = GlobalErrorHandle