const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Film = require('../models/Film.js');
const User = require('../models/User.js');


const router = new Router();
router.get('/',async function(req,res){
	var dateNow = Date.now();
	var user ;
	const { user_Id } = req.session;
	if ( user_Id )
	{
		user = await User.findOne({
			where :{
				user_ID : user_Id 
			},
		});
	}
	const filmPublic = await Film.findAll({
		where :{
			film_DatePublic :{
				[Op.lte] : dateNow ,
			},
			film_Public : true ,
		}
	});
	const filmNoPublic = await Film.findAll({
		where :{
			film_DatePublic :{
				[Op.gt] : dateNow ,
			},
			film_Public : true ,
		}
	});

	const film = {  filmPublic : filmPublic , filmNoPublic : filmNoPublic } ;
	var ObjectHome = { film : film };
	if(user_Id)
	{
		const useR = {user : user};
		ObjectHome = {useR : useR , film : film };
	}
	res.render('home.ejs',{ObjectHome});
});




router.get('/film/:id',async function(req,res){
	const id = Number(req.params.id);
	const filmID =await Film.findOne({
		where :{
			film_ID : id ,
			film_Public : true ,
		}
	});
	// Dòng này cũng thế
	//console.log(filmID);
	res.render('home.ejs',{filmID});
});

router.get('/filmSearch',async function(req,res){

	const NameFilm = req.query.txtSearch ;
	const searchNameFilm = await Film.findAll({
		where :{
			film_Public : true ,
		film_Name : {
			[Op.substring] : NameFilm,
		}},
	});
	res.render('home.ejs',{searchNameFilm});
});





router.get('/forgotPassword',function(req,res){
	res.render('forgotPassword.ejs');
});


router.get('/logout',function(req,res){
	delete req.session.user_Id;
  	res.redirect('/');
});
module.exports =router;
