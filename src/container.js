const bcrypt = require('bcrypt');

const User = require('./infrastructure/persistence/sequelize/models/User');
const Ticket = require('./infrastructure/persistence/sequelize/models/Ticket');
const Cinema = require('./infrastructure/persistence/sequelize/models/Cinema');
const Cineplex = require('./infrastructure/persistence/sequelize/models/Cineplex');
const Film = require('./infrastructure/persistence/sequelize/models/Film');
const TimeShow = require('./infrastructure/persistence/sequelize/models/TimeShow');
const CinemaTimeShow = require('./infrastructure/persistence/sequelize/models/CinemaTimeShow');
const sendEmail = require('./infrastructure/messaging/sendEmail');
const generateCode = require('./infrastructure/security/generateVerificationCode');

const createAuthUseCases = require('./infrastructure/auth/createAuthUseCases');
const createAuthController = require('./interfaces/http/controllers/authController');
const authUseCases = createAuthUseCases({
    User,
    comparePassword: (password, hash) => bcrypt.compare(password, hash),
    hashPassword: password => bcrypt.hash(password, 10),
    sendEmail,
    generateCode,
});
const authController = createAuthController(authUseCases);

const ProfileRepository = require('./infrastructure/persistence/sequelize/ProfileRepository');
const GetProfile = require('./application/profile/GetProfile');
const UpdateProfile = require('./application/profile/UpdateProfile');
const createProfileController = require('./interfaces/http/controllers/profileController');
const profiles = new ProfileRepository({ User, Ticket, CinemaTimeShow, TimeShow, Film, Cinema, Cineplex });
const profileController = createProfileController({
    getProfile: new GetProfile({ profiles }),
    updateProfile: new UpdateProfile({ profiles, hashPassword: password => bcrypt.hash(password, 10) }),
});

const HomeRepository = require('./infrastructure/persistence/sequelize/HomeRepository');
const GetHomePage = require('./application/home/GetHomePage');
const SearchFilms = require('./application/home/SearchFilms');
const GetFilmList = require('./application/home/GetFilmList');
const GetFilmDetails = require('./application/home/GetFilmDetails');
const createHomeController = require('./interfaces/http/controllers/homeController');
const home = new HomeRepository({ Film, User, Cinema, Cineplex, TimeShow, CinemaTimeShow });
const homeController = createHomeController({
    getHomePage: new GetHomePage({ home }),
    searchFilms: new SearchFilms({ home }),
    getFilmList: new GetFilmList({ home }),
    getFilmDetails: new GetFilmDetails({ home }),
});

const BookingRepository = require('./infrastructure/persistence/sequelize/BookingRepository');
const GetSeatAvailability = require('./application/booking/GetSeatAvailability');
const AuthenticateBookingUser = require('./application/booking/AuthenticateBookingUser');
const BookSeats = require('./application/booking/BookSeats');
const createBookingController = require('./interfaces/http/controllers/bookingController');
const bookings = new BookingRepository({ User, Cinema, Cineplex, TimeShow, Film, CinemaTimeShow, Ticket });
const bookingController = createBookingController({
    bookings,
    getSeatAvailability: new GetSeatAvailability({ bookings }),
    authenticateBookingUser: new AuthenticateBookingUser({
        bookings,
        verifyPassword: (password, hash) => bcrypt.compare(password, hash),
    }),
    bookSeats: new BookSeats({ bookings, sendEmail }),
});

const AdminCatalogRepository = require('./infrastructure/persistence/sequelize/AdminCatalogRepository');
const AdminCatalogUseCases = require('./application/admin/AdminCatalogUseCases');
const createAdminCatalogController = require('./interfaces/http/controllers/adminCatalogController');
const adminCatalog = new AdminCatalogUseCases({
    catalog: new AdminCatalogRepository({ User, Cinema, Cineplex }),
});
const adminCatalogController = createAdminCatalogController({ catalog: adminCatalog });

const AdminDashboardRepository = require('./infrastructure/persistence/sequelize/AdminDashboardRepository');
const GetSalesSummary = require('./application/admin/GetSalesSummary');
const createAdminDashboardController = require('./interfaces/http/controllers/adminDashboardController');
const dashboard = new AdminDashboardRepository({ Ticket, Cinema, Cineplex, Film, CinemaTimeShow });
const adminDashboardController = createAdminDashboardController({
    getSalesSummary: new GetSalesSummary({ dashboard }),
});

const FilmRepository = require('./infrastructure/persistence/sequelize/FilmRepository');
const FilmImageStorage = require('./infrastructure/storage/FilmImageStorage');
const ManageFilms = require('./application/admin/ManageFilms');
const createAdminFilmController = require('./interfaces/http/controllers/adminFilmController');
const filmImageStorage = new FilmImageStorage();
const films = new ManageFilms({ films: new FilmRepository(Film), imageStorage: filmImageStorage });
const adminFilmController = createAdminFilmController({ films, imageStorage: filmImageStorage });

const ShowtimeRepository = require('./infrastructure/persistence/sequelize/ShowtimeRepository');
const ManageShowtimes = require('./application/admin/ManageShowtimes');
const createAdminShowtimeController = require('./interfaces/http/controllers/adminShowtimeController');
const showtimes = new ManageShowtimes({ showtimes: new ShowtimeRepository({ Cinema, Film, TimeShow, CinemaTimeShow }) });
const adminShowtimeController = createAdminShowtimeController({ showtimes });

module.exports = {
    auth: authController,
    profile: profileController,
    home: homeController,
    booking: bookingController,
    adminCatalog: adminCatalogController,
    adminDashboard: adminDashboardController,
    adminFilms: adminFilmController,
    adminShowtimes: adminShowtimeController,
};
