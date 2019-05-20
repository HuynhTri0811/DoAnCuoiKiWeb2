const express = require('express');
const db = require('./models/db');
const session = require('express-session');


// Create app 
const app = express();
const port = process.env.PORT || 3000 ;

// Set view engine 
app.set('view engine' , 'ejs');
app.set('views','./views');


//Router

app.use('/',require('./routes/home'));
app.use('/login',require('./routes/Login'));
app.use('/signup',require('./routes/signUp'));

//Connect database 
app.listen(port);
console.log(`Connect server online with port ${port}`);
