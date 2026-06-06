// middleware/studentAuth.js

const jwt = require('jsonwebtoken');
const Student = require('../models/student');

exports.studentAuth = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            req.user = await Student.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    message: 'Student not found'
                });
            }

            next();

        } catch (err) {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            message: 'No token provided'
        });
    }
};