const Sequelize = require('sequelize');
const url = process.env.DATABASE_URL || 'postgres://admin:admin@localhost:5432/Web2'
const db = new Sequelize(url);

module.exports = db;
