// middleware/ authMiddleware.js

const jwt = require ('jsonwebtoken');
const User = require ('../models/User');

// Middleware to verify token
exports.protect = async (req, res, next) => {
	let token;

	// condition to check for Bearer token
	if (
		req.headers.authorization && 
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			// Extract token
			token = req.headers.authorization.split(' ')[1];

			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Attach user to request (excluding password)
			req.user = await User.findById(decoded.id).select('-password');

			if (!req.user) 
				return res.status(401).json({ message: 'User not found' });
			

			next();
		} catch (error) {
			return res.status(401).json({ message: 'Not Authorized, token failed' });
		}
	}

	if (!token) {
		return res.status(401).json({ message: 'Not Authorized, No token' });
	}
};



//Principal and Admin
exports.principal = (req, res, next) => {
	const allowedRoles = [ 'principal', 'admin' ];

  	if ( allowedRoles.includes(req.user.role)) {
    	next();
  	} else {
    	res.status(403).json({ message: "Not authorized as admin" });
  	}
};


//Principal and Admin
exports.staffProtect  = (req, res, next) => {
	const allowedRoles = [ 'teacher', 'principal', 'admin' ];

  	if ( allowedRoles.includes(req.user.role)) {
    	next();
  	} else {
    	res.status(403).json({ message: "Not authorized" });
  	}
};