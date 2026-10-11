const Sequelize = require('sequelize');

module.exports = {
    Sequelize,
    Op: Sequelize.Op,
    user: require('../../../models/User.js'),
    ticket: require('../../../models/Ticket.js'),
    Cinema: require('../../../models/Cinema.js'),
    Cineplex: require('../../../models/Cineplex.js'),
    Film: require('../../../models/Film.js'),
    timeShow: require('../../../models/TimeShow.js'),
    CinemaTimeShow: require('../../../models/CinemaTimeShow.js'),
};
