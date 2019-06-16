const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models/User.js');
const Film = require('../models/Film.js');
const Cineplex = require('../models/Cineplex.js');
const Cinema = require('../models/Cinema.js');
const TimeShow = require('../models/TimeShow.js');
const CinemaTimeShow = require('../models/CinemaTimeShow.js');
const Ticket = require('../models/Ticket.js');

var formidable = require('formidable'); 
const bcrypt = require('bcrypt');
const saltRounds = 10;


const router = new Router();


router.get('/',async function(req,res){
    const { user_Id } = req.session;
    var user ;
    if ( user_Id )
	{
		user = await User.findOne({
			where :{
				user_ID : user_Id, 
			},
		});
    }
    if(user_Id)
    {
        var totalMoney = await Ticket.sum('ticket_TotalMoney',{
            where :{
                user_ID : user_Id,
            }
        });

        var all_ve = await Ticket.findAll({
            where :{
                user_ID : user_Id,
            }
        }).catch(async function(err){
			console.log("Lỗi bắt được là:");
           
        });

        var cinema_TimeShow = await CinemaTimeShow.findAll({
            where :{
                cinemaTimeShow_Date : all_ve[0].cinemaTimeShow_Date,
                cinema_ID : all_ve[0].cinema_ID,
                timeShow_ID : all_ve[0].timeShow_ID,
            },
            include :[
                { model : Film },
			    { model : TimeShow },
			    { model : Cinema, include :[
                    { model : Cineplex },
                ]},
            ]
        });

        console.log("Giá trị đọc được của all_ve:");
        console.log(all_ve);
        console.log("Giá trị đọc được của cinema_TimeShow:");
        console.log(cinema_TimeShow);

        res.render('infoUser.ejs',{user, totalMoney, all_ve, cinema_TimeShow});
    }
    else{
        res.redirect('/');
    }
});

router.post('/pagedf',async function(req,res){
    const { user_Id } = req.session;
    req.session.user_Id = user_Id;
	res.redirect('/');
});

router.post('/name',async function(req,res){
    const {user_Id} = req.session;
    var form = new formidable.IncomingForm();
    var {txtUserName} = req.body;
    if(form){
        if(user_Id){
            await User.update({
                user_Name : txtUserName ,
                },
                { where : {
                    user_ID : user_Id,
                    },
            }).then(function(){
                res.redirect('/updateInfo');
            }).catch(function(){
                res.render('404NotFound.ejs');
            });
        };
    }; 
});
router.post('/numberphone',async function(req,res){
    const {user_Id} = req.session;
    var form = new formidable.IncomingForm();
    var {txtUserNumberPhone} = req.body;
    if(form){
        if(user_Id){
            await User.update({
                user_NumberPhone : txtUserNumberPhone ,
                },
                { where : {
                    user_ID : user_Id,
                    },
            }).then(function(){
                res.redirect('/updateInfo');
            }).catch(function(){
                res.render('404NotFound.ejs');
            });
        };
    }; 
});
router.post('/email',async function(req,res){
    const {user_Id} = req.session;
    var form = new formidable.IncomingForm();
    var {txtUserEmail} = req.body;
    if(form){
        if(user_Id){
            await User.update({
                user_Email : txtUserEmail ,
                },
                { where : {
                    user_ID : user_Id,
                    },
            }).then(function(){
                res.redirect('/updateInfo');
            }).catch(function(){
                res.render('404NotFound.ejs');
            });
        };
    }; 
});
router.post('/password',async function(req,res){
    const {user_Id} = req.session;
    var form = new formidable.IncomingForm();
    var {txtUserPassword} = req.body;
    if(form){
        if(user_Id){
            const hash_pass = await bcrypt.hash(txtUserPassword,saltRounds);
            await User.update({
                user_Password : hash_pass ,
                },
                { where : {
                    user_ID : user_Id,
                    },
            }).then(function(){
                res.redirect('/updateInfo');
            }).catch(function(){
                res.render('404NotFound.ejs');
            });
        };
    }; 
});
router.post('/address',async function(req,res){
    const {user_Id} = req.session;
    var form = new formidable.IncomingForm();
    var {txtUserAddress} = req.body;
    if(form){
        if(user_Id){
            await User.update({
                user_Address : txtUserAddress ,
                },
                { where : {
                    user_ID : user_Id,
                    },
            }).then(function(){
                res.redirect('/updateInfo');
            }).catch(function(){
                res.render('404NotFound.ejs');
            });
        };
    }; 
});


module.exports =router;