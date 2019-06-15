const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Film = require('../models/Film.js');
const User = require('../models/User.js');
const Cineplex = require('../models/Cineplex.js');
const Cinema = require('../models/Cinema.js');
const TimeShow = require('../models/TimeShow.js');
const CinemaTimeShow = require('../models/CinemaTimeShow.js');
const Ticket = require('../models/Ticket.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var formidable = require('formidable'); 


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
	
	const film = {  filmPublic : filmPublic , filmNoPublic : filmNoPublic } ;
	res.render('home.ejs',{film , user});
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

router.get('/forgotPassword',function(req,res){
	res.render('forgotPassword.ejs');
});

router.get('/logout',function(req,res){
	delete req.session.user_Id;
  	res.redirect('/');
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
	const filmChieu = {  filmDangChieu : filmDangChieu , filmSapChieu : filmSapChieu } ;
	res.render('home.ejs',{filmChieu , user});
});

router.get('/phim/:id',async function(req,res){
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
			['cinema_ID','ASC']
		],
		include:[
			{ model : Cinema } , 
			{ model : Film } , 
			{ model : TimeShow },
		]
	});
	//console.log(cinemaTimeShow);
	res.render('home.ejs',{filmID,user,filmDangChieu2,cinemaTimeShow,cinema,cineplex});
});


router.post('/phim/:id',async function(req,res){
	const id_reqfilm = Number(req.params.id);

	var cinemaChosen = req.body.cinemaID;
	req.session.cinemaIDChosen = cinemaChosen;
	//console.log(cineplexIDChosen);
	res.redirect('/phim/muave/'+id_reqfilm);
});





router.get('/phim/muave/:id',async function(req,res)
{
	const id_Chosen = Number(req.params.id);
	const { user_Id } = req.session;
	if ( user_Id )
	{
		var user = await User.findOne({
			where :{
				user_ID : user_Id 
			},
		});
		const cinemaTimeShow = await CinemaTimeShow.findOne({
			where : {
				cinemaTimeShow_ID : id_Chosen ,
			} ,
			include:[
				{ model : Cinema , include :[
					{model : Cineplex},
				] } , 
				{ model : Film } , 
				{ model : TimeShow },
			]
		});
		const ticket = await Ticket.findAll({
			where :{
				cinemaTimeShow_Date : cinemaTimeShow.cinemaTimeShow_Date,
				timeShow_ID : cinemaTimeShow.timeShow_ID,
				cinema_ID : cinemaTimeShow.cinema_ID,
			}
		})
		res.render('users/muave.ejs',{ user, cinemaTimeShow, ticket });
		//console.log(cinemaTimeShow.dataValues.Cinema.Cineplex);
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
	const id_req = String(req.params.id);
	if (!user) {
		res.render('Login.ejs', { UserSaiPass });
	}
	else {
		const match = await bcrypt.compare(txtUserPassword, user.user_Password);
		if (match) {
			req.session.user_Id = user.user_ID;
			res.redirect('/phim/muave/'+id_req);
		}
		else {
			res.render('Login.ejs', { UserSaiPass });
		}
	}
});

router.get('/phim/muave/comeback/:id',async function(req,res){
	const id_req = String(req.params.id);
	res.redirect('/film/'+id_req);
});

router.post('/phim/muave/submit/:id',async function(req,res){
	const id_cinemaTimeShow_req = Number(req.params.id);
	const user_Chosen = req.session;
	var { txtChair, txtChairType, txtTotalMoney } = req.body;

	var timeShow_Chosen = await CinemaTimeShow.findOne({
		where :{
			cinemaTimeShow_ID : id_cinemaTimeShow_req,
		},
		include :[
			{ model : Film },
			{ model : TimeShow },
			{ model : Cinema, include :[
				{ model : Cineplex },
			]},
		],
	})
	var form = new formidable.IncomingForm();

	if(form){
		await Ticket.create({
			ticket_Chair : txtChair,
			ticket_ChairType : txtChairType,
			ticket_TotalMoney : txtTotalMoney,
			cinemaTimeShow_Date : timeShow_Chosen.cinemaTimeShow_Date,
			timeShow_ID : timeShow_Chosen.timeShow_ID,
			film_ID : timeShow_Chosen.film_ID,
			cinema_ID : timeShow_Chosen.cinema_ID,
			user_ID : user_Chosen.user_Id,
		}).then(async function(){
			console.log("Đã lưu vào DB");
			req.session.user_Id = user_Chosen.user_Id;

			res.render('users/da_muave.ejs',{timeShow_Chosen, txtChair, txtChairType, txtTotalMoney});
		}).catch(async function(err){
			console.log("Lỗi bắt được là:");
			console.log(err);
		});
	}	
});

router.post('/phim/muave/submit/back/:id', async function(req, res){
	const req_cinemaTimeShow_ID = Number(req.params.id);
	var timeShow_Chosen = await CinemaTimeShow.findOne({
		where :{
			cinemaTimeShow_ID : req_cinemaTimeShow_ID,
		}
	});
	var film_id = timeShow_Chosen.film_ID;
	res.redirect('/phim/'+film_id);
});

module.exports =router;

router.get('/support',function(req,res){
	const support = true;
	res.render('home.ejs',{support});
});

router.get('/intro',function(req,res){
	const intro = true;
	res.render('home.ejs',{intro});
});