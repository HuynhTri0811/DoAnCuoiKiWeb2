const router = require('../../src/interfaces/http/createRouter')();
const requireAdmin = require('../../src/interfaces/http/middleware/requireAdmin');
const { adminFilms: controller } = require('../../src/container');

router.get('/update/film/', requireAdmin, controller.list);
router.post('/update/film/:id', requireAdmin, controller.update);
router.post('/delete/film/:id', requireAdmin, controller.delete);
router.post('/create/film/', requireAdmin, controller.create);
router.get('/create/film/', requireAdmin, controller.createForm);

module.exports = router;
