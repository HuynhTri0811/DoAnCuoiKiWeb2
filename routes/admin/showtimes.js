const router = require('express').Router();
const { Op, Cinema, Film, timeShow, CinemaTimeShow } = require('./utils/models');

router.get('/update/cinemaTimeShow/cinema/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    req.session.cinemaID = id ;
    if( Admin ){
       const loi = req.session.loi ;
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
        res.render('admin.ejs',{timeShowCinemaIDcinema,cinemaAll,filmCinemaTimeShow,TimeShow,loi});
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
        const loi = req.session.loi ;
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
router.post('/create/cinemaTimeShow/',async function(req,res){
    const { Admin } = req.session;
    if(Admin){
        var {txtcinema_ID,txtCinemaTimeShow_Date,timeShowID,filmID} = req.body;
        console.log(txtCinemaTimeShow_Date);
        const cinemaTonTai = await CinemaTimeShow.findOne({
            where :{
                cinema_ID : txtcinema_ID ,
                cinemaTimeShow_Date : txtCinemaTimeShow_Date ,
                timeShow_ID : timeShowID, 
            }
        }).catch(async function(err){
            console.log(err);
        });
        if(cinemaTonTai){
            req.session.loi = 'bạn đã nhập xuất chiếu xày rồi . xin mời nhập lại';
            res.redirect('/admin/update/cinemaTimeShow/cinema/'+String(txtcinema_ID));
        }else{
            await CinemaTimeShow.create({
                cinema_ID : txtcinema_ID ,
                cinemaTimeShow_Date : txtCinemaTimeShow_Date ,
                timeShow_ID : timeShowID ,
                film_ID : filmID ,
            }).then(async function(){
                await delete req.session.loi;
                res.redirect('/admin/update/cinemaTimeShow/cinema/'+String(txtcinema_ID));
            }).catch(async function(){
                req.session.loi = 'bạn đã nhập xuất chiếu xày rồi . xin mời nhập lại';
                res.redirect('/admin/update/cinemaTimeShow/cinema/'+String(txtcinema_ID));
            });
        }
    }
    else {
        res.redirect('/');
    }
});
router.get('/create/cinemaTimeShow/',async function(req,res){
    const { Admin } = req.session ;
    if(Admin){
        res.redirect('/admin/update/cinemaTimeShow/');
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
