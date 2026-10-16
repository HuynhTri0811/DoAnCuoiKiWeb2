const Router = require('express').Router;
const User = require('../models/User.js');
const Film = require('../models/Film.js');
const Cineplex = require('../models/Cineplex.js');
const Cinema = require('../models/Cinema.js');
const TimeShow = require('../models/TimeShow.js');
const CinemaTimeShow = require('../models/CinemaTimeShow.js');
const Ticket = require('../models/Ticket.js');

const bcrypt = require('bcrypt');
const saltRounds = 10;
const registerProfileUpdateRoutes = require('./utils/profileUpdates');


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
            },
            include :[
                { model : CinemaTimeShow, include:[
                    { model : TimeShow },
                    { model : Film },
                    { model : Cinema, include:[
                        { model : Cineplex},
                    ]}
                ] }
            ]
        }).catch(async function(err){
			console.log("Lỗi bắt được là:");
           
        });


        console.log("Giá trị đọc được của all_ve:");
        console.log(all_ve);
        res.render('account/profile.ejs',{user, totalMoney, all_ve});
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

registerProfileUpdateRoutes(router, {
    User,
    hashPassword: password => bcrypt.hash(password, saltRounds),
});


module.exports =router;
