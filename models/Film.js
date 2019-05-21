const Sequelize = require('sequelize');
const db = require('./db');

const film = db.define('Film',{
    film_ID : {
        type : Sequelize.INTEGER,
        allowNull : false ,
        unique : true ,
        autoIncrement :true ,
    },
    film_Name :{ 
        type : Sequelize.STRING ,
        allowNull : false,
    },
    film_DatePublic :{
        type : Sequelize.DATE ,
        allowNull : true ,
    },
    film_Image :{
        type : Sequelize.STRING ,
        allowNull : true ,
    },
    film_Time :{
        type : Sequelize.INTEGER ,
        allowNull : true ,
    }
});

module.exports = film ;