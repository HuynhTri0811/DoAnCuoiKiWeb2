const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Film = require('../models/Film.js');

const router = new Router();
router.get('/',async function(req,res){
	const film = await Film.findAll({
		order : [
			/*['film_ViewCount' , 'DESC']	*/
		]
	});
	console.log(film[0].dataValues.film_Name);
	res.render('home.ejs',{film});
});
router.get('/forgotPassword',function(req,res){
	res.render('forgotPassword.ejs');
});

module.exports =router;
