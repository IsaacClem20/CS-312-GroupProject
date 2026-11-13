
// Middleware to require an authenticated user
function requireAuth(req, res, next) {

    // Check whether the session contains a logged-in user
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: "Authentication required. Please log in."
        });
    }

    // User is authenticated; continue to the requested route
    next();
}

module.exports = requireAuth;
