const router = require('express').Router();
const { Op, Cinema, Cineplex } = require('./utils/models');

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
        }).then(function(){
            res.redirect('/admin/update/cinema/');
        }).catch(function(){
            res.render('404NotFound.ejs');
        });
    }
    else{
        res.redirect('/');
    }
});
router.get('/update/cinema/:id',async function(req,res){
    res.render('404NotFound.ejs');
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
            }).then(function(){
                res.redirect('/admin/update/cinema/');
            }).catch(function(){
                res.render('404NotFound.ejs');
            });
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
            where :{
                 cineplex_ID : txtCineplexName ,
            }}
        ).catch(function(){
            console.log('co loi gi do roi m oi ');
        });


        if(await cineplex_Name_id){
            await Cinema.create({
                cinema_Name : txtCinemaName,
                cinema_Type : txtCinemaType ,
                cinema_Length : txtCinemaLength ,
                cinema_Width : txtCinemaWidth,
                CineplexCineplexID : cineplex_Name_id.dataValues.cineplex_ID
            }).then(function(){
                res.redirect('/admin/update/cinema');
            }).catch(function(err){
                console.log(err);
                res.render('404NotFound.ejs');
            });
        }else{
            res.redirect('/admin');
        }
    }else{
        res.redirect('/');
    }
});
router.get('/create/cinema/',async function(req,res){
    res.render('404NotFound.ejs');
});

module.exports = router;
