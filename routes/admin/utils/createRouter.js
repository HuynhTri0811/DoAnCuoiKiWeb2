const express = require('express');

const routeMethods = ['get', 'post', 'put', 'patch', 'delete', 'all'];

function createRouter() {
    const router = express.Router();

    routeMethods.forEach(method => {
        const registerRoute = router[method].bind(router);
        router[method] = function(path, ...handlers) {
            const wrappedHandlers = handlers.map(handler => {
                if (typeof handler !== 'function' || handler.constructor.name !== 'AsyncFunction') {
                    return handler;
                }

                return function(req, res, next) {
                    Promise.resolve(handler(req, res, next)).catch(next);
                };
            });

            return registerRoute(path, ...wrappedHandlers);
        };
    });

    return router;
}

module.exports = createRouter;
