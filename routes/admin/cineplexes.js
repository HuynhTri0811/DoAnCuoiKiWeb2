const router = require('../../src/interfaces/http/createRouter')();
const requireAdmin = require('../../src/interfaces/http/middleware/requireAdmin');
const { adminCatalog: controller } = require('../../src/container');

router.get('/update/cineplex', requireAdmin, controller.listCineplexes);
router.post('/delete/cineplex/:id', requireAdmin, controller.deleteCineplex);
router.post('/update/cineplex/:id', requireAdmin, controller.updateCineplex);
router.get('/update/cineplex/:id', requireAdmin, function(req, res) {
    return res.redirect('/admin/update/cineplex');
});
router.post('/create/cineplex/', requireAdmin, controller.createCineplex);
router.get('/create/cineplex/', requireAdmin, function(req, res) {
    return res.redirect('/admin/update/cineplex');
});

module.exports = router;
