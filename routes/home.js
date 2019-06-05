const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Film = require('../models/Film.js');
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;



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
	res.render('home.ejs',{film , user});
});




router.get('/film/:id',async function(req,res){
	const id = Number(req.params.id);
	const filmID =await Film.findOne({
		where :{
			film_ID : id ,
			film_Public : true ,
		}
	});
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
	// Dòng này cũng thế
	//console.log(filmID);
	res.render('home.ejs',{filmID,user});
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
	var user ;
	const { user_Id } = req.session;
	if ( user_Id )
	{
		user = await User.findOne({
			where :{
				user_ID : user_Id 
			},
		});
	};
	res.render('home.ejs',{searchNameFilm,user});
});



router.get('/phim',async function(req,res){
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
	const filmDangChieu = await Film.findAll({
		where :{
			film_DatePublic :{
				[Op.lte] : dateNow ,
			},
			film_Public : true ,
		}
	});
	const filmSapChieu = await Film.findAll({
		where :{
			film_DatePublic :{
				[Op.gt] : dateNow ,
			},
			film_Public : true ,
		}
	});
	
	const filmChieu = {  filmDangChieu : filmDangChieu , filmSapChieu : filmSapChieu } ;
	res.render('home.ejs',{filmChieu , user});
});




router.get('/phim/muave/:id',async function(req,res)
{
	const { user_Id } = req.session;
	const id_Chosen = Number(req.params.id);
	const filmChosen = await Film.findOne({
		where :{
			film_ID : id_Chosen ,
			film_Public : true,
		}
	});
	if ( user_Id )
	{
		var user = await User.findOne({
			where :{
				user_ID : user_Id 
			},
		});
		res.render('users/muave.ejs',{filmChosen, user});
		console.log(filmChosen);
	} else {
		res.render('Login.ejs');
	}
});

router.post('/phim/muave/:id',async function(req,res){
	var { txtUserEmail , txtUserPassword } =req.body;
	var UserSaiPass = 'abc';
	const user = await User.findOne({
		where: {
			user_Email: txtUserEmail,
		}
	});
	if (!user) {
		res.render('Login.ejs', { UserSaiPass });
	}
	else {
		const match = await bcrypt.compare(txtUserPassword, user.user_Password);
		if (match) {
			req.session.user_Id = user.user_ID;
			res.redirect('/phim/muave/:id');
		}
		else {
			res.render('Login.ejs', { UserSaiPass });
		}
	}
});

router.get('/forgotPassword',function(req,res){
	res.render('forgotPassword.ejs');
});

router.get('/logout',function(req,res){
	delete req.session.user_Id;
  	res.redirect('/');
});
module.exports =router;
