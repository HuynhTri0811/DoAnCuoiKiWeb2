const router = require('express').Router();
const fs = require('fs');
const formidable = require('formidable');
const { Film } = require('./utils/models');

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
router.get('/create/film/',async function(req,res){
    const { Admin } = req.session;
    if(Admin){
        res.redirect('/admin/update/film');
    }else{
        res.redirect('/');
    }
});

module.exports = router;
