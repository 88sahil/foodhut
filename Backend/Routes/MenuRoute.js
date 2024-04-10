const Menuroute  = require('express').Router({mergeParams:true});
const {protected} = require('../Controllers/UserController')
const MenuController = require('../Controllers/MenuController')
const upload = require('../middlewares/multer')
Menuroute.route('/addMenu').post(protected,MenuController.createMenu)
Menuroute.route('/updatemenu/:menuId').patch(protected,MenuController.updatemenu)
Menuroute.route('/uploadphoto/:menuId').patch(protected,upload,MenuController.addPhoto)
Menuroute.route('/deletemenu/:menuId').delete(protected,MenuController.deletemenu)
Menuroute.route('/addquantitytocust/:menuId').patch(protected,MenuController.addQuantitycust)
Menuroute.route('/deletequantitytocust/:menuId').patch(protected,MenuController.deletequantity)
Menuroute.route('/addontocust/:menuId').patch(protected,MenuController.addoncust)
Menuroute.route('/deleteaddontocust/:menuId').patch(protected,MenuController.deleteaddon)
module.exports = Menuroute
