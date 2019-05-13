const Router = require('express').Router;
const fs = require('fs');


const router = new Router();
router.use('/',function(req,res){
	res.render('home');
});

module.exports =router;
