const Sequelize = require('sequelize');
const db = require('./db');
const cineplex =  require('./Cineplex.js');

const Cinema = db.define('Cinema',{
	Cinema_ID : {
		type : Sequelize.UUID ,
		primarykey :true ,
		allowNull :false,
	},
	Cinema_Name :{
		type : Sequelize.STRING ,
		allowNull : false,
	},
	Cinema_Type :{
		type : Sequelize.STRING ,
		allowNull : false,
	},
	Cinema_Length :{
		type : Sequelize.INTEGER ,
		allowNull : false,
	},
	Cinema_Width :{
		type : Sequelize.INTEGER ,
		allowNull : false,
	},
	Cinema_Cinelex_ID :{
		type : Sequelize.INTEGER ,
		allowNull : false ,
	},
});

cineplex.belongsTo(Cinema);

module.exports = Cinema;
