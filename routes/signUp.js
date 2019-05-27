const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const router = new Router();

router.get('/',function(req,res){
	res.render('signUp.ejs');
});
router.post('/',async function(req,res){
	var {user_Email ,user_Password ,user_Name,user_NumberPhone } = req.body ;
	await user.create({
		user_Email ,
		user_Password,
		user_Name ,
		user_NumberPhone,
	}).then(function(user){
		console.log('Create user succes ');
	}).catch(function(err){
		console.log(err,req.body);
	});
	res.redirect('/');
});
module.exports = router;
