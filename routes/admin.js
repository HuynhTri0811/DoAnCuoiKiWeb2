const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const Cinema = require('../models/Cinema.js');
const Cineplex = require('../models/Cineplex.js');
const Film = require('../models/Film.js');
const router = new Router();

router.get('/',async function(req,res){
    const { Admin } = req.session;
    if(Admin)
    {
        res.render('admin.ejs');
    }
    else{
        res.redirect('/');
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
    else{
        res.redirect('/');
    }
});

router.get('/update/user',async function(req,res){
    const { Admin } = req.session;
    if(Admin){
        const userAll =  await user.findAll({
        
        });
        res.render('admin.ejs',{userAll});
    }
    else{
        res.redirect('/');
    }
});

router.get('/update/film',async function(req,res){
    const { Admin } = req.session;
    if(Admin){
        const filmAll= await Film.findAll({
            order : [
                ['film_ID','ASC']
            ]
        });
        res.render('admin.ejs',{filmAll});
    }
    else{
        res.redirect('/');
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
        res.redirect('/admin/update/cinema/');
    }
    else{
        res.redirect('/');
    }
});
router.get('/update/cinema',async function(req,res){
    const { Admin } = req.session ;
    if(Admin){
        const cinema = await Cinema.findAll({
            include:[{
                model : Cineplex,
            }]
        });  
        res.render('admin.ejs',{cinema});
    }
    else{
        res.redirect('/');
    }
})


module.exports = router;
