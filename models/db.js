const Sequelize = require('sequelize');
const url = process.env.DATABASE_URL || 'postgres://admin:admin@localhost:5432/Web_Ban_Ve'
const db = new Sequelize(url);

module.export = db;
