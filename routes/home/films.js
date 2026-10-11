const router = require('express').Router();
const { Op, Film, User, Cineplex, Cinema, TimeShow, CinemaTimeShow } = require('./utils/models');

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
		},
		order:[
			['film_DatePublic','DESC']
		],
	});
	const filmSapChieu = await Film.findAll({
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
	const filmXemNhieu = await Film.findAll({
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
	const filmChieu = {  filmDangChieu : filmDangChieu , filmSapChieu : filmSapChieu, filmXemNhieu : filmXemNhieu } ;
	res.render('layouts/home.ejs',{filmChieu , user});
});

router.get('/phim/:id',async function(req,res){
	const id = Number(req.params.id);

	var viewCount_new = await Film.findOne({
		where :{
			film_ID : id,
		}
	})
	await Film.update(
		{ film_ViewCount : viewCount_new.dataValues.film_ViewCount + 1},
		{where :{
			film_ID : id,
		}}
		)
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
	var dateNow = Date.now();
	const filmDangChieu2 = await Film.findAll({
		where :{
			film_DatePublic :{
				[Op.gt] : dateNow ,
			},
			film_Public : true ,
		},
	});
	const cinema = await Cinema.findAll();
	const cineplex = await Cineplex.findAll();
	const cinemaTimeShow = await CinemaTimeShow.findAll({
		where :{
			film_ID : id,  
		},
		order:[
			['cinema_ID','ASC'],
			['timeShow_ID', 'ASC'],
		],
		include:[
			{ model : Cinema } , 
			{ model : Film } , 
			{ model : TimeShow },
		]
	});

	//console.log(cinemaTimeShow);
	res.render('layouts/home.ejs',{filmID,user,filmDangChieu2,cinemaTimeShow,cinema,cineplex});
});


router.post('/phim/:id',async function(req,res){
	const id_reqfilm = Number(req.params.id);

	var cinemaChosen = req.body.cinemaID;
	req.session.cinemaIDChosen = cinemaChosen;
	//console.log(cineplexIDChosen);
	res.redirect('/phim/muave/'+id_reqfilm);
});

module.exports = router;
