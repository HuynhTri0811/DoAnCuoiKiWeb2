const Sequelize = require('sequelize');
const db = require('./db.js');
const cinemaTimeShow = require('./CinemaTimeShow.js');
const user = require('./User.js');

const tiket = db.define('Ticket' ,{
	tiket_ID :{
		type : Sequelize.INTEGER ,
		allowNull : true ,
		primaryKey : true ,
	},
	tiket_Date :{
		type : Sequelize.DATE,
		allowNull : true,
		defaultValue : null,
    },
    tiket_ChairType :{
        type : Sequelize.STRING,
        allowNull : true,
    },
    tiket_Chair :{
        type : Sequelize.STRING,
        allowNull : true,
    },
    tiket_TotalMoney :{
        type : Sequelize.INTEGER,
        allowNull : true,
    },
	cinemaTimeShow_ID :{
		type : Sequelize.INTEGER,
		allowNull : false ,
    },
    user_ID :{
        type : Sequelize.INTEGER,
        allowNull : false,
    },
});

tiket.belongsTo(cinemaTimeShow,{
	foreignKey : 'cinemaTimeShow_ID',
});
tiket.belongsTo(user,{
    foreignKey : 'user_ID',
});

module.exports = tiket;