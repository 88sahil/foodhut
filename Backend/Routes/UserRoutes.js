const express = require('express')
const UserRoute = express.Router();
const UserController  = require('../Controllers/UserController');
const User = require('../model/UserMdel');
const upload = require('../middlewares/multer')
UserRoute.route('/createUser').post(UserController.createuser)
UserRoute.route('/LoginUser').post(UserController.SignInUser)
UserRoute.route('/verify').get(UserController.protected,UserController.verify)
UserRoute.route('/updatepassword').patch(UserController.protected,UserController.updatepassword)
UserRoute.route('/forgotpassword').post(UserController.Forgotpassword)
UserRoute.route('/changepassword/:string').patch(UserController.changepassword)
UserRoute.route('/updateMe').patch(UserController.protected,UserController.updateMe)
UserRoute.route('/deleteuser/:id').patch(UserController.protected,UserController.restricatedTo('user','admin'),UserController.deleteUser)
UserRoute.route('/uploadFile').patch(UserController.protected,upload,UserController.uploadProfile)
UserRoute.route('/addtocart').post(UserController.protected,UserController.addTocart)
UserRoute.route('/removefromcart').post(UserController.protected,UserController.removefromcart)
UserRoute.route('/logout').get(UserController.logout)
module.exports = UserRoute