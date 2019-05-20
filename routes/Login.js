const Router = require('express').Router;
const fs = require('fs');

const router = new Router();
router.get('/',function(req,res){
	res.render('Login.ejs');
});

router.get('/forgotPassword',function(req,res){
	res.render('forgotPassword.ejs');
});

module.exports = router;
