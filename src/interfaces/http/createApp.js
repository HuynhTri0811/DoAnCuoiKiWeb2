const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

/** Khởi tạo ứng dụng Express cùng middleware và router chính. */
function createApp() {
    const app = express();
    const projectRoot = path.resolve(__dirname, '../../..');

    app.set('view engine', 'ejs');
    app.set('views', path.join(projectRoot, 'views'));
    app.use('/public', express.static(path.join(projectRoot, 'public')));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        resave: false,
        saveUninitialized: true,
    }));

    app.use('/forgotPassword', require('../../../routes/forgotPassword'));
    app.use('/', require('../../../routes/home'));
    app.use('/login', require('../../../routes/Login'));
    app.use('/signup', require('../../../routes/signUp'));
    app.use('/updateInfo', require('../../../routes/updateInfo'));
    app.use('/admin', require('../../../routes/admin'));

    return app;
}

module.exports = createApp;
