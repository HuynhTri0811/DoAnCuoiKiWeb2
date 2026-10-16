const router = require('../../src/interfaces/http/createRouter')();
const requireAdmin = require('../../src/interfaces/http/middleware/requireAdmin');
const { adminCatalog: controller } = require('../../src/container');

router.get('/update/user', requireAdmin, controller.listUsers);
router.post('/update/user/:id', requireAdmin, controller.updateUser);
router.get('/update/user/:id', function(req, res) {
    return res.render('pages/404.ejs');
});
router.post('/delete/user/:id', requireAdmin, controller.deleteUser);

module.exports = router;
