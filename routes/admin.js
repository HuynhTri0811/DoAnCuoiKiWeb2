const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const router = new Router();

router.get('/',function(req,res){
	res.render('admin.ejs');
});


module.exports = router;
