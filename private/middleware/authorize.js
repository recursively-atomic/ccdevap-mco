/**
 * Authorizes access to certain pages, and if a user does not have
 * the authorized role, they will be redirected to a home dashboard page.
 * 
 * @param {String[]} authorizedRoles is the array of user roles permitted to access a route.
 * @returns {function(Request, Response, NextFunction)} the middleware.
 */
function authorize(authorizedRoles) {
    return function (req, res, next) {
        const userRole = req.session?.user?.role;

        if (authorizedRoles.includes(userRole)) {
            return next();
        }

        if (userRole === 'admin') {
            return res.redirect('/dashboard');
        } else if (userRole === 'user') {
            return res.redirect('/home');
        }
    };
}

module.exports = { authorize };