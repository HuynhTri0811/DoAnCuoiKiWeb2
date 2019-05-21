const Sequelize = require('sequelize');
const db = require('./db');


const User = db.define('User', {
	user_ID : {
		type : Sequelize.INTEGER ,
		primaryKey : true ,
		allowNull : false,
		autoIncrement :true ,
	},
	user_Email : {
		type : Sequelize.STRING ,
		allowNull : false,
		unique : true,
	},
	user_PassWord : {
		type : Sequelize.STRING ,
		allowNull : false ,
	},
	user_Name : {
		type : Sequelize.STRING ,
		allowNull : false ,
	},
	user_numberPhone : {
		type : Sequelize.STRING ,
		allowNull : false ,		
	}

});

module.exports = User ;
