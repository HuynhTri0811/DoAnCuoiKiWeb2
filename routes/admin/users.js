const router = require('express').Router();
const { user } = require('./utils/models');

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
        }).then(()=>{
            res.redirect('/admin/update/user/');
        }).catch(()=>{
            res.render('404NotFound.ejs');
        });
    }else{
        res.redirect('/');
    }
});
router.get('/update/user/:id',async function(req,res){
    res.render('404NotFound.ejs');
});
router.get('/delete/user/:id',async function(req,res){
    const { Admin } = req.session;
    const id = Number(req.params.id);
    if(Admin){
        await user.destroy({
            where  :{
                user_ID : id,
            }
        }).then(function(){
            res.redirect('/admin/update/user/');
        }).catch(function(err){
            res.render('404NotFound.ejs');
        });
    }else{
        res.redirect('/');
    }
});

module.exports = router;
