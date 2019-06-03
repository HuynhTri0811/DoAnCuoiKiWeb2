const Router = require('express').Router;
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

	var User;
	const {email } = req.body;
	User = await user.findOne({
		where: {
			user_Email:email,
		}
	});

	if(User)
	{
		user.update({
			user_Code: macode,
		}, {
			where: {
				user_Email: req.body.email,
			} 
			});
			const info = await sendEmail(req.body.email, 'Quên mật khẩu', 'Bạn có quên mật khẩu', macode);
			res.render('resetPassword.ejs');
	}

	else
	{
		
	}

  });
	

module.exports = router;
