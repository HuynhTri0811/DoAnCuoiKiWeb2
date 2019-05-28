const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const Cinema = require('../models/Cinema.js');
const Cineplex = require('../models/Cineplex.js');
const router = new Router();

router.get('/',async function(req,res){
    const { Admin } = req.session;
    if(Admin==="Admin123@gmail.com")
    {
        const cinema = await Cinema.findAll({
            include:[{
                model : Cineplex,
            }]
        });  
        res.render('admin.ejs',{cinema});
    }
});

router.get('/update/cinema/:id', async function(req,res){
    const { Admin } =req.session;
    const id = Number(req.params.id);
    if(Admin)
    {
        const cinemaid = await Cinema.findOne({
            where :{
                cinema_ID : id ,
            }
        });
        res.render('admin.ejs',{cinemaid});
    }
});


router.post('/update/cinema/:id',async function(req,res){
    const { Admin } = req.session;
    const id =Number(req.params.id);
    if(Admin){
        var { txtCinemaType ,txtCinemaLength,txtCinemaWidth } =req.body;
        await Cinema.update({
            cinema_Type : txtCinemaType ,
            cinema_Length : txtCinemaLength ,
            cinema_Width :txtCinemaWidth ,
            },{
                where : {
                    cinema_ID : id , 
                }
            }
        );
        res.redirect('/');
    }
});


router.get('/')

module.exports = router;
