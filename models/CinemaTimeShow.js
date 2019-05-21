const Sequelize = require('sequelize');
const db = require('./db');
const cinema = require('./Cinema.js');
const film = require('./Film.js');


const cinemaTimeShow = db.difine('CinemaTimeShow' ,{
	cinemaTimeShow_TimeStart :{
		type : Sequelize.DATE,
		allowNull : true,
		defaultValue : null,
	},
	cinemaTimeShow_TimeEnd :{
		type : Sequelize.DATE ,
		allowNull : true ,
	},
	cinema_ID :{
		type : Sequelize.INTEGER ,
		allowNull : false ,
		primarykey : true ,
	},
	film_ID :{
		type : Sequelize.INTEGER ,
		allowNull :false ,
		primarykey : true,
	},
	cinemaTimeShow_PriceTicket :{
		type :  Sequelize.INTEGER ,
		allowNull :false ,
	},
});

cinema.belongsTo(cinemaTimeShow);
film.belongsTo(cinemaTimeShow);

module.exports = CinemaTimeShow;
