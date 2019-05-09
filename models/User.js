const Sequelize = require('sequelize');
const db = require('./db');


const User = db.define('User', {
	User_ID : {
		type : Sequelize.UUID ,
		primaryKey : true ,
		allowNull : false,
	},
	User_Email : {
		type : Sequelize.STRING ,
		allowNull : false,
		unique : true,
	},
	User_PassWord : {
		type : Sequelize.STRING ,
		allowNull : false ,
	},
	User_Name : {
		type : Sequelize.STRING ,
		allowNull : false ,
	},
	User_numberPhone : {
		type : Sequelize.STRING ,
		allowNull : false ,		
	}

});

module.exports = User ;