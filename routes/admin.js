const Router = require('express').Router;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const user = require('../models/User.js');
const Cinema = require('../models/Cinema.js');
const Cineplex = require('../models/Cineplex.js');
const Film = require('../models/Film.js');
const timeShow = require('../models/TimeShow.js');
const CinemaTimeShow = require('../models/CinemaTimeShow.js');
const router = new Router();
var multer = require('multer');
var formidable = require('formidable'); 



const upload = multer({dest: __dirname + '/uploads/images'});

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
router.get('/logout',async function(req,res){
    delete req.session.Admin;
    res.redirect('/');
});


//cinema 
router.get('/update/cinema',async function(req,res){
    const { Admin } = req.session ;
    if(Admin){
        const cinema = await Cinema.findAll({
            include:[{
                model : Cineplex,
            }]
        });
        const Adress = await Cineplex.findAll({
           
        });
        res.render('admin.ejs',{cinema,Adress});
    }
    else{
        res.redirect('/');
    }
});
router.get('/delete/cinema/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    if(Admin){
        await Cinema.destroy({
            where  :{
                cinema_ID : id,
            }
        });
        res.redirect('/admin/update/cinema/');
    }
    else{
        res.redirect('/');
    }
});
router.post('/update/cinema/:id',async function(req,res){
    const { Admin } = req.session;
    const id =Number(req.params.id);
    if(Admin){
        var {txtCinemaName, txtCinemaType ,txtCinemaLength,txtCinemaWidth,txtCineplexName } =req.body;
        var cineplex_Name_id = await Cineplex.findOne({
            where :{ cineplex_Name :{
                [Op.substring]: txtCineplexName ,
            }}
        });
        if(cineplex_Name_id){
            await Cinema.update({
                cinema_Name : txtCinemaName ,
                cinema_Type : txtCinemaType ,
                cinema_Length :  txtCinemaLength ,
                cinema_Width :  txtCinemaWidth ,
                CineplexCineplexID : cineplex_Name_id.dataValues.cineplex_ID } , 
                {
                    where :{
                        cinema_ID : id,
                    },
            });
            res.redirect('/admin/update/cinema/');
        }else{
            res.redirect('/admin');
        }
    }
    else{
        res.redirect('/');
    }
});
router.post('/create/cinema/',async function(req,res){
    const { Admin } = req.session;
    if( Admin ){
        var { txtCinemaName , txtCinemaType ,txtCinemaLength , txtCinemaWidth , txtCineplexName} = req.body;
        const cineplex_Name_id = await Cineplex.findOne({
            where :{ cineplex_Name :{
                [Op.substring]: txtCineplexName ,
            }}
        });
        if(cineplex_Name_id){
            await Cinema.create({
                cinema_Name : txtCinemaName,
                cinema_Type : txtCinemaType ,
                cinema_Length : txtCinemaLength ,
                cinema_Width : txtCinemaWidth,
                CineplexCineplexID : cineplex_Name_id.dataValues.cineplex_ID
            });
            res.redirect('/admin/update/cinema');
        }else{
            res.redirect('/admin');
        }
    }else{
        res.redirect('/');
    }
});



//user
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
router.post('/update/user/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    if( Admin ){
        var {txtUserEmail, txtUserName ,txtUserNumberPhone} =req.body;
        await user.update({
            user_Email : txtUserEmail , 
            user_Name : txtUserName , 
            user_NumberPhone : txtUserNumberPhone ,
            },{
                where :{
                    user_ID : id ,
                },
        });
    }else{
        res.redirect('/');
    }
});
router.get('/delete/user/:id',async function(req,res){
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if(Admin){
        await user.destroy({
            where  :{
                user_ID : id,
            }
        });
        res.redirect('/admin/update/user/');
    }else{
        res.redirect('/');
    }
});



//film
router.get('/update/film/',async function(req,res){
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
router.post('/update/film/:id',async function(req,res){
    const { Admin } = req.session;
    const id = req.params.id;
    if(Admin){
        res.redirect('/admin/');
    }else{
        res.redirect('/');
    }
});
router.get('/delete/film/:id',async function(req,res){
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if(Admin){
        await Film.destroy({
            where :{
                film_ID : id ,
            },
        });
        res.redirect('/admin/update/film/');
    } else {
        res.redirect('/');
    }
});
router.post('/create/film/',async function(req,res){
    const { Admin } = req.session;
    if(Admin){
        var form = new formidable.IncomingForm();
        await form.parse(req,function(err,filds,files){
            var oldpath ="dasdasdas";
            var newpath = 'public/image' + file.filetoupload.name ;
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.write('File uploaded and moved!');
                res.end();
            });
        });
        var {txtFilmName ,txtFilmDatePublic ,txtFilmTime,txtFilmImage} = req.body;
        if(form){
            await Film.create({
                film_Name : txtFilmName ,
                film_Image : '/public/image/'+ txtFilmImage ,
                film_DatePublic : txtFilmDatePublic,
                film_Time : txtFilmTime ,
            });
            res.redirect('/admin/update/film');
        }else{
            console.log("loi cmnr 2");
            res.redirect('/admin/update/film');
        }
    }
});


// Cineplex 
router.get('/update/cineplex',async function(req,res){
    const { Admin } = req.session;
    if( Admin ){
        const cineplex = await Cineplex.findAll({

        });
        res.render('admin.ejs',{cineplex});
    } else {
        res.redirect('/');
    }
});
router.get('/delete/cineplex/:id',async function(req,res){
    const { Admin } =req.session;
    const id =Number(req.params.id);
    if(Admin){
        await Cineplex.destroy({
            where :{
                cineplex_ID : id,
            }
        });
        res.redirect('/admin/update/cineplex');
    } else {
        res.redirect('/');
    }
});
router.post('/update/cineplex/:id',async function(req,res){
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if(Admin){
        var { txtCineplexName , txtCineplexAdress} = req.body ;
        await Cineplex.update({
            cineplex_Name : txtCineplexName ,
            cineplex_Adress :txtCineplexAdress ,
        },{
            where :{
                cineplex_ID : id ,
            }
        });
        res.redirect('/admin/update/cineplex');
    }else{
        res.redirect('/');
    }
});
router.post('/create/cineplex/',async function(req,res){
    const { Admin } = req.session ;
    if(Admin){
        var { cineplex_Name , cineplex_Adress } = req.body ;
        await Cineplex.create({
            cineplex_Name ,
            cineplex_Adress ,
        });
        res.redirect('/admin/update/cineplex');
    }else{
        res.redirect('/');
    }
});


//CinemaTimeShow
router.get('/update/cinemaTimeShow/cinema/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    req.session.cinemaID = id ;
    if( Admin ){
       
        const timeShowCinemaIDcinema =  await CinemaTimeShow.findAll({
            where :{
                cinema_ID : id  
            }
            ,include:[
                { model : Cinema } , 
                { model : Film } , 
                { model : timeShow },
            ]
        });
        const cinemaAll = await Cinema.findAll({
            where :{
                cinema_ID : id ,
            }
        });
        const TimeShow = await timeShow.findAll({

        });
        var dateNow = Date.now();
        const filmCinemaTimeShow = await Film.findAll({
            where :{
                film_DatePublic :{
                    [Op.lte] : dateNow ,
                },
                film_Public : true ,
            }
        });
        res.render('admin.ejs',{timeShowCinemaIDcinema,cinemaAll,filmCinemaTimeShow,TimeShow});
    }
    else{
        res.redirect('/');
    }
});
router.get('/update/cinemaTimeShow/film/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    req.session.cinemaID = id ;
    if( Admin ){
       
        const timeShowCinemaIDcinema =  await CinemaTimeShow.findAll({
            where :{
                film_ID : id  
            }
            ,include:[
                { model : Cinema } , 
                { model : Film } , 
                { model : timeShow },
            ]
        });
        const cinemaAll = await Cinema.findAll({
            
        });
        const TimeShow = await timeShow.findAll({

        });

        var dateNow = Date.now();
        const filmCinemaTimeShow = await Film.findAll({
            where :{
                film_ID : id ,
            }
        });
        res.render('admin.ejs',{timeShowCinemaIDcinema,cinemaAll,filmCinemaTimeShow,TimeShow});
    }
    else{
        res.redirect('/');
    }
});
router.post('/create/cinemaTimeShow',async function(req,res){
    const { Admin } = req.session;
    if(Admin){
        var {txtcinema_ID,txtCinemaTimeShow_Date,timeShowID,filmID} = req.body;
        await CinemaTimeShow.create({
            cinema_ID : txtcinema_ID ,
            cinemaTimeShow_Date : txtCinemaTimeShow_Date ,
            timeShow_ID : timeShowID ,
            film_ID : filmID ,
        });
        res.redirect('/admin/update/cinemaTimeShow/cinema/'+String(txtcinema_ID));
    }
    else {
        res.redirect('/');
    }
});
router.get('/update/cinemaTimeShow/film/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    if( Admin ){
        const timeShowCinemaIDfilm = await CinemaTimeShow.findAll({
            where :{
                film_ID : id ,
            }
        });
        res.render('admin.ejs',{timeShowCinemaIDfilm})
    }else{
        res.redirect('/');
    }
});
router.get('/delete/cinemaTimeShow/cinema/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    const cinemaID = req.session ;
    if( Admin ){
        await CinemaTimeShow.destroy({
            where : {
                cinemaTimeShow_ID :  id ,
            }
        });
        res.redirect('/update/cinemaTimeShow/cinema/'+String(cinemaID));
    }
    else{
        res.redirect('/');
    }
});

module.exports = router;