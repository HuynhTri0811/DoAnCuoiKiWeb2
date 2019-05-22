const Router = require('express').Router;
const fs = require('fs');
const Film = require('../models/Film.js');

const router = new Router();
router.get('/',function(req,res){
	const film = Film.max('film_ViewCount').then(max => 
		{

		});	
	res.render('home.ejs',{film});
});
router.get('/forgotPassword',function(req,res){
	res.render('forgotPassword.ejs');
});

module.exports =router;
