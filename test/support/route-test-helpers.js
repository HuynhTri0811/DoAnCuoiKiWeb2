const Module = require('node:module');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '../..');

function loadWithMocks(relativePath, mocks = {}) {
    const entryPath = path.resolve(projectRoot, relativePath);
    delete require.cache[entryPath];

    const originalLoad = Module._load;
    Module._load = function(request, parent, isMain) {
        let resolvedPath;
        try {
            resolvedPath = Module._resolveFilename(request, parent, isMain);
        } catch (error) {
            if (!Object.prototype.hasOwnProperty.call(mocks, request)) throw error;
        }

        if (Object.prototype.hasOwnProperty.call(mocks, request)) return mocks[request];
        if (resolvedPath && Object.prototype.hasOwnProperty.call(mocks, resolvedPath)) {
            return mocks[resolvedPath];
        }
        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        return require(entryPath);
    } finally {
        Module._load = originalLoad;
    }
}

function routeHandler(router, method, routePath) {
    const layer = router.stack.find(item => item.route
        && item.route.path === routePath
        && item.route.methods[method.toLowerCase()]);
    if (!layer) throw new Error(`Route ${method.toUpperCase()} ${routePath} was not registered`);
    return layer.route.stack[0].handle;
}

function createRequest(overrides = {}) {
    return {
        body: {},
        params: {},
        query: {},
        session: {},
        ...overrides,
    };
}

function createResponse() {
    const response = { calls: [] };
    response.render = (view, locals) => {
        response.calls.push({ type: 'render', view, locals });
        return response;
    };
    response.redirect = location => {
        response.calls.push({ type: 'redirect', location });
        return response;
    };
    response.status = statusCode => {
        response.statusCode = statusCode;
        return response;
    };
    return response;
}

function modelPath(name) {
    return path.join(projectRoot, 'src', 'infrastructure', 'persistence', 'sequelize', 'models', `${name}.js`);
}

function routeModelsPath(feature) {
    return path.join(projectRoot, 'routes', feature, 'utils', 'models.js');
}

module.exports = {
    createRequest,
    createResponse,
    loadWithMocks,
    modelPath,
    routeHandler,
    routeModelsPath,
};
