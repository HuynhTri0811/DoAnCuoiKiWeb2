const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models/User.js');


const router = new Router();


router.get('/',async function(req,res){
    const { user_Id } = req.session;
    var user ;
    if ( user_Id )
	{
		user = await User.findOne({
			where :{
				user_ID : user_Id 
			},
		});
    }
    if(user_Id)
    {
        res.render('infoUser.ejs',{user});
    }
    else{
        res.redirect('/');
    }
});

module.exports =router;