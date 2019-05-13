const Router = require('express').Router;
const fs = require('fs');


const router = new Router();
router.get('/',function(req,res){
	res.render('home');
});
