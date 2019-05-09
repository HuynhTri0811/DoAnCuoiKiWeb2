const Sequelize = require('sequelize');
const db = require('./db');

const Film = db.define('Film',{
    Film_ID : {
        type : Sequelize.UUID,
        allowNull : false ,
        unique : true ,
    },
    Film_name :{ 
        type : Sequelize.STRING ,
        allowNull : false,
    },
    Film_datePublic :{
        type : Sequelize.DATE ,
        allowNull : true ,
    },
    Film_image :{
        type : Sequelize.STRING ,
        allowNull : true ,
    },
    Film_time :{
        type : Sequelize.INTEGER ,
        allowNull : true ,
    }
});

module.exports = Film ;