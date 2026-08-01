/**
 * Authenticates the user's session if it exists and allows
 * the user to access a page, and redirects to the login page 
 * if the session doesn't exist.
 * 
 * @param {Request} req is the request object.
 * @param {Response} res is the response object.
 * @param {NextFunction} next is the next middleware function.
 */
function authenticate(req, res, next) {
    if (!req.session?.user) {
        return res.redirect('/login');
    }

    return next();
}

module.exports = { authenticate };