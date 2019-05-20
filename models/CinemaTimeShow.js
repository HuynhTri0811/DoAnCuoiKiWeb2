const Sequelize = require('sequelize');
const db = require('./db');
const Cinema = require('./Cinema.js');
const Film = require('./Film.js');


const CinemaTimeShow = db.difine('CinemaTimeShow' ,{
	CinemaTimeShow_TimeStart :{
		type : Sequelize.DATE,
		allowNull : true,
		defaultValue : null,
	},
	CinemaTimeShow_TimeEnd :{
		type : Sequelize.DATE ,
		allowNull : true ,
	}
});
