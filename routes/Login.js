const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const router = new Router();
router.get('/',function(req,res){
	res.render('Login.ejs');
});

router.post('/',async function(req,res){
	var { user_Email , user_Password } =req.body;
	const User =  await user.findOne({
		where : { user_Email },
	});
	if(!User){
		throw Error('Wrong email/password');
	}
	if(user_Password != User.user_Password){
		throw Error('2 Wrond email/password');
	}
	req.session.user_Name =User.user_Name ;
	res.redirect('/');
});

	

module.exports = router;
