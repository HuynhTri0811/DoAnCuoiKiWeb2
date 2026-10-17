/** Chuyển lỗi từ handler bất đồng bộ sang middleware xử lý lỗi của Express. */
function asyncHandler(handler) {
    /** Thực thi handler và chuyển Promise bị từ chối cho next(). */
    return function wrappedHandler(req, res, next) {
        return Promise.resolve(handler(req, res, next)).catch(next);
    };
}

module.exports = asyncHandler;
