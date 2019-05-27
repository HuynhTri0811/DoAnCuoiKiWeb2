const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const router = new Router();
const signup = require('./signUp.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;



router.get('/',function(req,res){
	res.render('Login.ejs');
});

router.post('/',async function(req,res){
	var { txtUserEmail , txtUserPassword } =req.body;
	var UserSaiPass = 'abc';
	const User = await user.findOne({
		where :{
			user_Email : txtUserEmail ,
		}
	});
	if(!User){
		res.render('Login.ejs',{UserSaiPass});
	}
	const match = await bcrypt.compare(txtUserPassword, User.user_Password);
	if(match) {
		console.log('da login');
        req.session.user_Id = User.user_ID ;
		res.redirect('/');
	}
	if(match == false)
	{
		res.render('Login.ejs',{UserSaiPass});
	}
	
	

});

	

module.exports = router;
