const router = require('./utils/createRouter')();
const { Cineplex } = require('./utils/models');

router.get('/update/cineplex',async function(req,res){
    const { Admin } = req.session;
    if( Admin ){
        const cineplex = await Cineplex.findAll();
        res.render('admin.ejs' ,{ cineplex });
    } else {
        res.redirect('/');
    }
});
router.post('/delete/cineplex/:id',async function(req,res){
    const { Admin } =req.session;
    const id =Number(req.params.id);
    if(Admin){
        try {
            await Cineplex.destroy({ where: { cineplex_ID: id } });
            return res.redirect('/admin/update/cineplex');
        } catch (error) {
            console.error('Unable to delete cineplex:', error);
            return res.render('404NotFound.ejs');
        }
    } else {
        res.redirect('/');
    }
});
router.post('/update/cineplex/:id',async function(req,res){
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if(Admin){
        var { txtCineplexName , txtCineplexAdress} = req.body ;
        try {
            await Cineplex.update({
                cineplex_Name: txtCineplexName,
                cineplex_Adress: txtCineplexAdress,
            }, { where: { cineplex_ID: id } });
            return res.redirect('/admin/update/cineplex');
        } catch (error) {
            console.error('Unable to update cineplex:', error);
            return res.render('404NotFound.ejs');
        }
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
        const { cineplex_Name, cineplex_Adress } = req.body;
        try {
            await Cineplex.create({ cineplex_Name, cineplex_Adress });
            return res.redirect('/admin/update/cineplex');
        } catch (error) {
            console.error('Unable to create cineplex:', error);
            return res.render('404NotFound.ejs');
        }
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
