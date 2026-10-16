function total(idField, nameField, id, name, moneyField, countField) {
    return { [idField]: id, [nameField]: name, [moneyField]: 0, [countField]: 0 };
}

class GetSalesSummary {
    constructor({ dashboard }) { this.dashboard = dashboard; }

    async execute(startDate, endDate) {
        const { filmSales, cinemaSales, films, cinemas, cineplexes } = await this.dashboard.getSales(startDate, endDate);
        const filmTotals = new Map(films.map(film => [film.film_ID,
            total('ID_film', 'Name_film', film.film_ID, film.film_Name, 'TotalMoney_film', 'CountTicket_film')]));
        const cinemaTotals = new Map(cinemas.map(cinema => [cinema.cinema_ID, {
            ...total('ID_cinema', 'Name_cinema', cinema.cinema_ID, cinema.cinema_Name, 'TotalMoney_cinema', 'CountTicket_cinema'),
            ID_cineplex: cinema.CineplexCineplexID,
        }]));
        const cineplexTotals = new Map(cineplexes.map(cineplex => [cineplex.cineplex_ID,
            total('ID_cineplex', 'Name_cineplex', cineplex.cineplex_ID, cineplex.cineplex_Name, 'TotalMoney_cineplex', 'CountTicket_cineplex')]));

        const addSales = (rows, idField, totals, moneyField, countField) => rows.forEach(row => {
            const related = row.CinemaTimeShow;
            const item = related && totals.get(related[idField]);
            if (!item) return;
            item[moneyField] += Number(row.dataValues.TongTien || 0);
            item[countField] += Number(row.dataValues.SoVeBanDuoc || 0);
        });
        addSales(filmSales, 'film_ID', filmTotals, 'TotalMoney_film', 'CountTicket_film');
        addSales(cinemaSales, 'cinema_ID', cinemaTotals, 'TotalMoney_cinema', 'CountTicket_cinema');
        cinemaTotals.forEach(cinema => {
            const cineplex = cineplexTotals.get(cinema.ID_cineplex);
            if (!cineplex) return;
            cineplex.TotalMoney_cineplex += cinema.TotalMoney_cinema;
            cineplex.CountTicket_cineplex += cinema.CountTicket_cinema;
        });
        return { thuocTinhFilm: Array.from(filmTotals.values()), thuocTinhCumRap: Array.from(cineplexTotals.values()) };
    }
}

module.exports = GetSalesSummary;
