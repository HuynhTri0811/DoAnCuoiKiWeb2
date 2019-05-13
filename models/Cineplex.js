const Sequelize = require('sequelize');
const db = require('./db');

const Cineplex = fb.define('Cineplex' ,{
    Cineplex_ID : {
        type : Sequelize.UUID ,
        primarykey : true ,
        allowNull : false ,
    },
    Cineplex_name : {
        type : Sequelize.STRING ,
        allowNull : false ,
    },
    Cineplex_Adress : {
        type : Sequelize.STRING ,
        allowNull : false ,
    }
});

module.exports = Cineplex ;