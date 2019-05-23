const express = require('express');
const db = require('./models/db');
const bodyParser = require('body-parser');
const session = require('express-session');


// Create app 
const app = express();
const port = process.env.PORT || 3000 ;

// Set view engine 
app.set('view engine' , 'ejs');
app.set('views','./views');
app.use('/public',express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true,
  }));
  app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
  }));
  

//Router

app.use('/',require('./routes/home'));
app.use('/login',require('./routes/Login'));
app.use('/signup',require('./routes/signUp'));

//Connect database 
db.sync().then(function(){
	app.listen(port);
	console.log(`Server is listening on port ${port}`);
}).catch(function(err){
	console.log(err);
	process.exit(1);
});
