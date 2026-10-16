const router = require('../../src/interfaces/http/createRouter')();
const requireAdmin = require('../../src/interfaces/http/middleware/requireAdmin');
const { adminDashboard: controller } = require('../../src/container');

router.get('/', requireAdmin, controller.show);
router.post('/', requireAdmin, controller.filter);
router.get('/logout', controller.logout);

module.exports = router;
