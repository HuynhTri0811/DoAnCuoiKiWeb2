const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const router = new Router();

router.get('/',function(req,res){
	res.render('signUp.ejs');
});
router.post('/',async function(req,res){
	var {user_Email , user_Name , user_NumberPhone ,user_Password } = req.body ;
	await user.create({
		user_Email ,
		user_Name ,
		user_NumberPhome,
		user_Password,
	}).then(function(user){
		console.log('Create user succes ');
	}).catch(function(err){
		console.log(err,req.body);
	});
});
module.exports = router;
