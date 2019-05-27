const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const router = new Router();

router.get('/',function(req,res){
	res.render('signUp.ejs');
});
router.post('/',async function(req,res){
	var {user_Email ,user_Password ,user_Name,user_NumberPhone } = req.body ;
	const hash = await bcrypt.hash(user_Password,saltRounds);
	await	user.create({
				user_Email ,
				user_Password : hash,
				user_Name ,
				user_NumberPhone,
			}).then(function(user){
				req.session.user_Id = user.user_ID ;
				res.redirect('/');
				console.log('Create user succes ');
			}).catch(function(err){
				console.log(err,req.body);
			});
});
module.exports = router;
