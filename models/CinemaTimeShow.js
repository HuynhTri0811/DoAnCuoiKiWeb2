const Sequelize = require('sequelize');
const db = require('./db.js');
const cinema = require('./Cinema.js');
const film = require('./Film.js');


const cinemaTimeShow = db.define('CinemaTimeShow' ,{
	cinemaTimeShow_ID :{
		type : Sequelize.INTEGER ,
		allowNull : true ,
		primaryKey : true,
		autoIncrement :true ,
	},
	cinemaTimeShow_Date :{
		type : Sequelize.DATE,
		allowNull : true,
		primaryKey : true,
		defaultValue : null,
	},
	cinemaTimeShow_Start :{
		type : Sequelize.TIME ,
		primaryKey : true ,
		allowNull : true ,
	},
	cinemaTimeShow_End :{
		type : Sequelize.TIME ,
		primaryKey : true ,
		allowNull : true ,
	},
	film_ID : {
		type : Sequelize.INTEGER,
		allowNull : true ,
	},
	cinema_ID :{
		type : Sequelize.INTEGER,
		primaryKey : true ,
		allowNull : true ,
	}
});

cinemaTimeShow.belongsTo(cinema,{
	foreignKey : 'cinema_ID',
});
cinemaTimeShow.belongsTo(film,{
	foreignKey : 'film_ID',
});


module.exports = cinemaTimeShow;
