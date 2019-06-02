const Router = require('express-promise-router');
const router = new Router();
const sendEmail  = require('../models/email.js');
const user = require('../models/User.js');
function Random() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
	for (var i = 0; i < 10; i++)
	  text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
  }

router.get('/', function (req, res) {
	res.render('forgotPassword.ejs'); 
  });
router.post('/', async function (req, res) {   
	var macode =Random();
	user.update({
		user_Code: macode,
	}, {
		where: {
			user_Email: req.body.email,
		} 
	  });
	const info = await sendEmail(req.body.email, 'Quên mật khẩu', 'Bạn có quên mật khẩu', macode);
	res.render('resetPassword.ejs');
  });
	

module.exports = router;
