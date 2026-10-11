const router = require('./utils/createRouter')();
const { Op, Cinema, Film, timeShow, CinemaTimeShow } = require('./utils/models');

router.get('/update/cinemaTimeShow/cinema/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    if( Admin ){
        if (!Number.isInteger(id) || id <= 0) return res.render('pages/404.ejs');
        req.session.cinemaTimeShowReturnPath = `/admin/update/cinemaTimeShow/cinema/${id}`;
        const loi = req.session.loi;
        delete req.session.loi;
        const timeShowCinemaIDcinema =  await CinemaTimeShow.findAll({
            where :{
                cinema_ID : id  
            }
            ,include:[
                { model : Cinema } , 
                { model : Film } , 
                { model : timeShow },
            ]
        });
        const cinemaAll = await Cinema.findAll({
            where :{
                cinema_ID : id ,
            }
        });
        const TimeShow = await timeShow.findAll({

        });
        var dateNow = Date.now();
        const filmCinemaTimeShow = await Film.findAll({
            where :{
                film_DatePublic :{
                    [Op.lte] : dateNow ,
                },
                film_Public : true ,
            }
        });
        res.render('layouts/admin.ejs',{timeShowCinemaIDcinema,cinemaAll,filmCinemaTimeShow,TimeShow,loi});
    }
    else{
        res.redirect('/');
    }
});
router.get('/update/cinemaTimeShow/film/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    if( Admin ){
        if (!Number.isInteger(id) || id <= 0) return res.render('pages/404.ejs');
        req.session.cinemaTimeShowReturnPath = `/admin/update/cinemaTimeShow/film/${id}`;
        const loi = req.session.loi;
        delete req.session.loi;
        const timeShowCinemaIDcinema =  await CinemaTimeShow.findAll({
            where :{
                film_ID : id  
            }
            ,include:[
                { model : Cinema } , 
                { model : Film } , 
                { model : timeShow },
            ]
        });
        const cinemaAll = await Cinema.findAll({
            
        });
        const TimeShow = await timeShow.findAll({

        });

        var dateNow = Date.now();
        const filmCinemaTimeShow = await Film.findAll({
            where :{
                film_ID : id ,
            }
        });
        res.render('layouts/admin.ejs',{timeShowCinemaIDcinema,cinemaAll,filmCinemaTimeShow,TimeShow,loi});
    }
    else{
        res.redirect('/');
    }
});
router.post('/create/cinemaTimeShow/',async function(req,res){
    const { Admin } = req.session;
    if(Admin){
        const { txtcinema_ID, txtCinemaTimeShow_Date, timeShowID, filmID } = req.body;
        const cinemaId = Number(txtcinema_ID);
        const showtimeId = Number(timeShowID);
        const movieId = Number(filmID);
        const returnPath = getShowtimeReturnPath(req, cinemaId);
        if (![cinemaId, showtimeId, movieId].every(value => Number.isInteger(value) && value > 0)
            || !txtCinemaTimeShow_Date) {
            req.session.loi = 'Thông tin xuất chiếu không hợp lệ. Vui lòng kiểm tra lại.';
            return res.redirect(returnPath);
        }

        try {
            const existingShowtime = await CinemaTimeShow.findOne({
                where: {
                    cinema_ID: cinemaId,
                    cinemaTimeShow_Date: txtCinemaTimeShow_Date,
                    timeShow_ID: showtimeId,
                },
            });
            if (existingShowtime) {
                req.session.loi = 'Suất chiếu này đã tồn tại. Vui lòng chọn thời gian khác.';
                return res.redirect(returnPath);
            }

            await CinemaTimeShow.create({
                cinema_ID: cinemaId,
                cinemaTimeShow_Date: txtCinemaTimeShow_Date,
                timeShow_ID: showtimeId,
                film_ID: movieId,
            });
            delete req.session.loi;
            return res.redirect(returnPath);
        } catch (error) {
            console.error('Unable to create showtime:', error);
            req.session.loi = 'Không thể tạo suất chiếu. Vui lòng kiểm tra lại thông tin.';
            return res.redirect(returnPath);
        }
    }
    else {
        res.redirect('/');
    }
});
router.get('/create/cinemaTimeShow/',async function(req,res){
    const { Admin } = req.session ;
    if(Admin){
        res.redirect('/admin/update/cinemaTimeShow/');
    }else{
        res.redirect('/');
    }
});
router.post('/delete/cinemaTimeShow/cinema/:id',async function(req,res){
    const { Admin } = req.session ;
    const id = Number(req.params.id);
    if( Admin ){
        if (!Number.isInteger(id) || id <= 0) return res.render('pages/404.ejs');
        const returnPath = getShowtimeReturnPath(req);
        try {
            await CinemaTimeShow.destroy({
                where: { cinemaTimeShow_ID: id },
            });
            return res.redirect(returnPath);
        } catch (error) {
            console.error('Unable to delete showtime:', error);
            return res.render('pages/404.ejs');
        }
    }
    else{
        res.redirect('/');
    }
});

function getShowtimeReturnPath(req, fallbackCinemaId) {
    const returnPath = req.session.cinemaTimeShowReturnPath;
    if (/^\/admin\/update\/cinemaTimeShow\/(cinema|film)\/\d+$/.test(returnPath || '')) {
        return returnPath;
    }
    if (Number.isInteger(fallbackCinemaId) && fallbackCinemaId > 0) {
        return `/admin/update/cinemaTimeShow/cinema/${fallbackCinemaId}`;
    }
    return '/admin/update/cinema';
}

module.exports = router;
