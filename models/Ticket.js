const Sequelize = require('sequelize');
const db = require('./db.js');
const cinemaTimeShow = require('./CinemaTimeShow.js');
const user = require('./User.js');

const tiket = db.define('Ticket' ,{
	ticket_ID :{
		type : Sequelize.INTEGER ,
		allowNull : false ,
        primaryKey : true ,
        autoIncrement : true,
	},
    ticket_ChairType :{
        type : Sequelize.STRING,
        allowNull : true,
    },
    ticket_Chair :{
        type : Sequelize.STRING,
        allowNull : true,
    },
    ticket_TotalMoney :{
        type : Sequelize.INTEGER,
        allowNull : true,
    },
	cinemaTimeShow_Date :{
		type : Sequelize.DATE,
		allowNull : true,
    },
    film_ID : {
		type : Sequelize.INTEGER,
		allowNull : true ,
    },
    cinema_ID :{
		type : Sequelize.INTEGER,
		allowNull : true ,
	},
    user_ID :{
        type : Sequelize.INTEGER,
        allowNull : false,
    },
});

tiket.belongsTo(cinemaTimeShow,{
    foreignKey : 'cinemaTimeShow_ID',
    foreignKey : 'film_ID',
    foreignKey : 'cinema_ID',
});
tiket.belongsTo(user,{
    foreignKey : 'user_ID',
});

module.exports = tiket;