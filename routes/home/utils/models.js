const Sequelize = require('sequelize');

module.exports = {
    Op: Sequelize.Op,
    Film: require('../../models/Film.js'),
    User: require('../../models/User.js'),
    Cineplex: require('../../models/Cineplex.js'),
    Cinema: require('../../models/Cinema.js'),
    TimeShow: require('../../models/TimeShow.js'),
    CinemaTimeShow: require('../../models/CinemaTimeShow.js'),
    Ticket: require('../../models/Ticket.js'),
};
