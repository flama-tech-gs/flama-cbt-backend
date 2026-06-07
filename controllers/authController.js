//controllers/authController.js

const User = require('../models/User');
const Student = require('../models/student');
const createToken = require('../utils/jwt');


 //POST    Register Teacher
exports.register = async (req, res) => {
	try {
		
		const { surname, firstname, email, password } = req.body;
		
		if (!surname || !firstname || !email || !password)
			return res.status(400).json({ message: 'All fields are required'});

		//validate email
		const eExist = await User.findOne({ email });

		if (eExist)
			return res.status(400).json({ message: "User already exists" })
		
		//create user
		const user = await User.create ({
			surname,
			firstname,
			email,
			password,
			role: 'teacher',
			isVerified: false,
		});

		res.status(201).json({
			_id: user._id,
			surname: user.surname,
			firstname: user.firstname,
			email: user.email,
			role: user.role,
			isVerified: user.isVerified
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};


//PUT   Verify Teacher
exports.acceptTeacher = async (req, res) => {
	try {

		const { email, role } = req.body;

		if (!email)
			return res.status(400).json({ message: 'Email is required'});

		//Admin/principal are allowed
		if (req.user.role !== 'admin' && req.user.role !== 'principal')
			return res.status(400).json({ message: 'You are not authorize' });

		if(!role)
			return res.status(400).json({ message: 'Role id required' });

		// Only teacher role allowed
		const allowedRoles = ['teacher'];

		if (!allowedRoles.includes(role))
			return res.status(400).json({ message: 'The role is not allowed'});

		// find user
		const user = await User.findOne({ email });
		
		if (!user)
		 	return res.status(400).json({ message: 'User not found'});

		 
		// Update user 
		user.role = role;
		user.isVerified = true;

		await user.save();

		res.status(200).json({
			message: 'Teacher has been accepted',
		  	user
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};


//POST  Login 
exports.login = async ( req, res ) => {
	try {
		const { identifier, password } = req.body;

		if (!identifier || !password)
			return res.status(400).json ({ message: 'All the fields are required'})

		//Teacher/Admin/Principal Login
		//check if identifier is email 
		const isEmail = identifier.includes('@');

		if (isEmail) {
			const user = await User.findOne({ email: identifier });

			if (!user)
				return res.status(404).json({ message: 'User not found' });

			// Teacher must be verified
			if( user.role === 'teacher' && !user.isVerified)
				return res.status(400).json({ message: 'Account not yet verified' });

			//compare password
			const isPassword = await user.comparePassword(password);

			if (!isPassword)
				return res.status(400).json({ message: 'Invalid Credentials' });

			return res.json({
				_id: user._id,
				surename: user.surname,
				firstname: user.firstname,
				email: user.email,
				role: user.role,
				token: createToken(user) 
			});
		}


		//Student Login
		const student = await Student.findOne({ access_code: identifier });

		if (!student) 
			return res.status(400).json({ message: 'Student not found' });
		
		//surname or hashed password check
		const isPassword = await student.comparePassword(password);

		if (!isPassword)
			return res.status(400).json({ message: 'Invalid Credentials' });

		return res.json({
			_id: student._id,
			surename: student.surname,
			firstname: student.firstname,
			email: student.email,
			access_code: student.access_code,
			role: student.role,
			token: createToken(student) 
		});

	} catch (err) {
		console.error("LOGIN ERROR:", err);
    res.status(500).json({
        message: err.message
    });
	}
};


