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
	},
	Cinema_ID :{
		type : Sequelize.INTEGER ,
		allowNull : false ,
		primarykey : true ,
	},
	Film_ID :{
		type : Sequelize.INTEGER ,
		allowNull :false ,
		primarykey : true,
	},
});

Cinema.belongsTo(CinemaTimeShow);
Fiml.belongsTo(CinemaTimeShow);

module.exports = CinemaTimeShow;
