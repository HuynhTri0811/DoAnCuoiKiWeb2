const router = require('express').Router();
const { Cineplex } = require('./utils/models');

router.get('/update/cineplex',async function(req,res){
    const { Admin } = req.session;
    if( Admin ){
        /* const TongTienCineplex =  await ticket.findAll({
            include :[
                { model : CinemaTimeShow   , include : [{ model :  Cinema  }] }
            ]
        }).then(function(TongTien){
            console.TongTien();
            for(let i = 0 ; i < TongTien.length ;i++){
                console.log(TongTien[i].CinemaTimeShow.Cinema.Cineplex.cineplex_Name);
                console.log(TongTien[i].CinemaTimeShow.Cinema.Cineplex.cineplex_ID);
            }
        }).catch(async function(err){
            console.log(err);
        }); */
        /* var tempPhim = 0;
        while(SoFilm[tempPhim] !== undefined){

        } */

        const cineplex = await Cineplex.findAll({
        }).catch(async function(){
            console.log('da bi loi');
            res.redirect('/admin');
        });
        res.render('admin.ejs' ,{ cineplex });
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
router.get('/update/cineplex/:id',async function(req,res){
    const { Admin } = req.session;
    if(Admin){
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
router.get('/create/cineplex/',async function(req,res){
    const { Admin } = req.session ;
    if(Admin){
        res.redirect('/admin/update/cineplex');
    }else{
        res.redirect('/');
    }
});

module.exports = router;
