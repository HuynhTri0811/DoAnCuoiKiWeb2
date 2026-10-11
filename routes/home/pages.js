const router = require('express').Router();
const { Op, Film, User } = require('./utils/models');

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
		},
		order:[
			['film_DatePublic','DESC']
		],
	});
	const filmNoPublic = await Film.findAll({
		where :{
			film_DatePublic :{
				[Op.gt] : dateNow ,
			},
			film_Public : true ,
		},
		order:[
			['film_DatePublic','ASC']
		],
	});
	const filmViewHigh = await Film.findAll({
		where :{
			film_DatePublic :{
				[Op.lte] : dateNow ,
			},
			film_Public : true ,
		},
		order :[
			['film_ViewCount','DESC'],
		]
	});
	
	const film = {  filmPublic : filmPublic , filmNoPublic : filmNoPublic, filmViewHigh : filmViewHigh } ;
	res.render('layouts/home.ejs',{film , user});
});

router.get('/filmSearch',async function(req,res){
	var dateNow = Date.now();
	const NameFilm = req.query.txtSearch ;
	const searchNameFilmPublic = await Film.findAll({
		where :{
			film_DatePublic :{
				[Op.lte] : dateNow ,
			},
			film_Public : true ,
			film_Name : {
				[Op.substring] : NameFilm,
			},
		},
		order:[
			['film_DatePublic','DESC']
		],
	});
	const searchNameFilmNoPublic = await Film.findAll({
		where :{
			film_DatePublic :{
				[Op.gt] : dateNow ,
			},
			film_Public : true ,
			film_Name : {
				[Op.substring] : NameFilm,
			},
		},
		order:[
			['film_DatePublic','ASC']
		],
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
	const searchNameFilm = { searchNameFilmPublic : searchNameFilmPublic, searchNameFilmNoPublic : searchNameFilmNoPublic}
	res.render('layouts/home.ejs',{searchNameFilm, user});
});

router.get('/forgotPassword',function(req,res){
	res.render('auth/forgot-password.ejs');
});

router.get('/logout',function(req,res){
	delete req.session.user_Id;
  	res.redirect('/');
});

router.get('/support',function(req,res){
	const support = true;
	res.render('layouts/home.ejs',{support});
});

router.get('/intro',function(req,res){
	const intro = true;
	res.render('layouts/home.ejs',{intro});
});

module.exports = router;
