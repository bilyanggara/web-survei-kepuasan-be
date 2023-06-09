const lib = require('./lib')
const jwt = require('jsonwebtoken');

const checkUserRole = (requiredRoles) => {
    return (req, res, next) => {
        // read cookie
        let token = ""
        try {
            const splitCookie = req.headers["cookie"].split(";")

            splitCookie.forEach(element => {
                const key = element.split("=")
                if (key[0].trim() === "Authorization") {
                    token = key[1]
                }
            });

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access"
            })
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.clearCookie('Authorization')

                if (jwt.TokenExpiredError) {
                    return res.status(401).json({
                        success: false,
                        message: "Session Expired",
                    })
                }

                return res.status(401).json({
                    success: false,
                    message: "Unauthorized Access",
                    err: err
                })
            }

            const role = user.role

            if (!requiredRoles.includes(role)) {
                res.clearCookie('Authorization')

                return res.status(401).json({
                    success: false,
                    message: "Unauthorized Access"
                })
            }

            next()
        });
    };
};

module.exports = checkUserRole;