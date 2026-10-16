const express = require('express');
const asyncHandler = require('./asyncHandler');
const routeMethods = ['get', 'post', 'put', 'patch', 'delete', 'all'];

function createRouter() {
    const router = express.Router();
    routeMethods.forEach(method => {
        const register = router[method].bind(router);
        router[method] = function(path, ...handlers) {
            return register(path, ...handlers.map(handler => (
                typeof handler === 'function' && handler.constructor.name === 'AsyncFunction'
                    ? asyncHandler(handler)
                    : handler
            )));
        };
    });
    return router;
}

module.exports = createRouter;
