const Router = require('express').Router;
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Film = require('../models/Film.js');

const router = new Router();
router.get('/',async function(req,res){
	const film = await Film.findAll({
		order : [
			/*['film_ViewCount' , 'DESC']	*/
		]
	});
	// Xóa dòng này đi , chừng nào cần thì show ra 
	//console.log(film);
	res.render('home.ejs',{film});
});


router.get('/film/:id',async function(req,res){
	const id = Number(req.params.id);
	const filmID =await Film.findOne({
		where :{
			film_ID : id ,
		}
	});
	// Dòng này cũng thế
	//console.log(filmID);
	res.render('home.ejs',{filmID});
});

router.get('/filmSearch',async function(req,res)
{
	const NameFilm = req.query.txtSearch ;
	const searchNameFilm =await Film.findAll({
		where :{
		film_Name : {
			[Op.substring] : NameFilm,
		}},
	});
	res.render('home.ejs',{searchNameFilm});
});

/* cái này để thứ 2 làm 
router.get('/filmPublic',async function(req ,res)
{
	const filmPublic = await Film.findAll({
		where :{

		}
	});
});
*/


router.get('/forgotPassword',function(req,res){
	res.render('forgotPassword.ejs');
});

module.exports =router;
