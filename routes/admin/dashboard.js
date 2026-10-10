const router = require('express').Router();
const { Sequelize, Op, ticket, Cinema, Cineplex, Film, CinemaTimeShow } = require('./utils/models');
const { redirectIfNotAdmin } = require('./utils/auth');

async function getSalesSummary(startDate, endDate) {
    const dateFilter = { [Op.between]: [startDate, endDate] };
    const [filmSales, cinemaSales, films, cinemas, cineplexes] = await Promise.all([
        ticket.findAll({
            attributes: [
                'CinemaTimeShow.film_ID',
                'CinemaTimeShow.cinemaTimeShow_ID',
                [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'],
                [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc'],
            ],
            group: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
            include: [{ model: CinemaTimeShow, where: { cinemaTimeShow_Date: dateFilter } }],
        }),
        ticket.findAll({
            attributes: [
                'CinemaTimeShow.cinema_ID',
                'CinemaTimeShow.cinemaTimeShow_ID',
                [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'],
                [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc'],
            ],
            group: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
            include: [{ model: CinemaTimeShow, where: { cinemaTimeShow_Date: dateFilter } }],
        }),
        Film.findAll({
            where: { film_DatePublic: { [Op.lte]: Date.now() }, film_Public: true },
        }),
        Cinema.findAll(),
        Cineplex.findAll(),
    ]);

    const makeTotals = (idKey, nameKey, id, name, moneyKey, countKey) => ({
        [idKey]: id,
        [nameKey]: name,
        [moneyKey]: 0,
        [countKey]: 0,
    });
    const filmTotals = new Map(films.map(film => [
        film.film_ID,
        makeTotals('ID_film', 'Name_film', film.film_ID, film.film_Name, 'TotalMoney_film', 'CountTicket_film'),
    ]));
    const cinemaTotals = new Map(cinemas.map(cinema => [
        cinema.cinema_ID,
        {
            ...makeTotals('ID_cinema', 'Name_cinema', cinema.cinema_ID, cinema.cinema_Name, 'TotalMoney_cinema', 'CountTicket_cinema'),
            ID_cineplex: cinema.CineplexCineplexID,
        },
    ]));
    const cineplexTotals = new Map(cineplexes.map(cineplex => [
        cineplex.cineplex_ID,
        makeTotals('ID_cineplex', 'Name_cineplex', cineplex.cineplex_ID, cineplex.cineplex_Name, 'TotalMoney_cineplex', 'CountTicket_cineplex'),
    ]));

    const addSales = (rows, idField, totals, moneyKey, countKey) => rows.forEach(row => {
        const total = totals.get(row.CinemaTimeShow[idField]);
        if (!total) return;
        total[moneyKey] += Number(row.dataValues.TongTien || 0);
        total[countKey] += Number(row.dataValues.SoVeBanDuoc || 0);
    });

    addSales(filmSales, 'film_ID', filmTotals, 'TotalMoney_film', 'CountTicket_film');
    addSales(cinemaSales, 'cinema_ID', cinemaTotals, 'TotalMoney_cinema', 'CountTicket_cinema');
    cinemaTotals.forEach(cinema => {
        const cineplex = cineplexTotals.get(cinema.ID_cineplex);
        if (!cineplex) return;
        cineplex.TotalMoney_cineplex += cinema.TotalMoney_cinema;
        cineplex.CountTicket_cineplex += cinema.CountTicket_cinema;
    });

    return {
        thuocTinhFilm: Array.from(filmTotals.values()),
        thuocTinhCumRap: Array.from(cineplexTotals.values()),
    };
}

async function renderSalesSummary(res, startDate, endDate) {
    res.render('admin.ejs', await getSalesSummary(startDate, endDate));
}

router.get('/', async function(req, res) {
    if (redirectIfNotAdmin(req, res)) return;
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(1);
    await renderSalesSummary(res, startDate, endDate);
});

router.post('/', async function(req, res) {
    if (redirectIfNotAdmin(req, res)) return;
    const { txtDateOne, txtDateTwo } = req.body;
    await renderSalesSummary(res, txtDateOne, txtDateTwo);
});
router.get('/logout',async function(req,res){
    delete req.session.Admin;
    res.redirect('/');
});

module.exports = router;
