//controllers/studentController.js

const Student = require ('../models/student');
const generateAccessCode = require('../utils/generateAccessCode');
const mongoose = require('mongoose');
const redisClient = require('../config/redis');


//Create Student
exports.createStudent = async (req, res) => {
	try{

		const {
			surname, firstname, email,
			class: studentClass, department
		} = req.body;

		if ( !surname || !firstname || !studentClass )
			return res.status(400).json({ message: 'Surname, Firstname and Class are required' });

		//Generate access code
		let access_code;
		let existingStudent;

		do {

			access_code = generateAccessCode();

			existingStudent =
				await Student.findOne({ access_code });

		} while (existingStudent);

		//Default Password
		const defaultPassword = surname.toLowerCase();

		//Create Student
		const student = await Student.create ({
			surname,
			firstname,
			email,
			access_code,
			password: defaultPassword,
			class: studentClass,
			department
		});

		//Invalidate redis cache
		const keys = await redisClient.keys('students:*');

		if (keys.length > 0) 
			await redisClient.del(keys);
		

		res.status(201).json({
			message: 'Student Created Successfully',
			_id: student._id,
			surname: student.surname,
			firstname: student.firstname,
			email: student.email,
			class: student.class,
			department: student.department,
			access_code: student.access_code,
			default_password: defaultPassword
		})

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};

//GET Get all students
exports.getAllStudents = async (req, res) => {
	try {

		const { page = 1, limit = 10, access_code, class: studentClass, department } = req.query;
		

		const cacheKey =
			`students:${page}:${limit}:${access_code || 'all'}:${studentClass || 'all'}:${department || 'all'}`;

		// CHECK CACHE
		const cachedStudents = await redisClient.get(cacheKey);

		if (cachedStudents) {
			return res.json(JSON.parse(cachedStudents));
		}

		const query = {};  //for filtering

		if (access_code)
			query.access_code = access_code;
		if ( studentClass )
			query.class = studentClass;
		if (department)
			query.department = department;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		/*
		const students = await Student.find(query)
										.select('-password')
										.skip(skip)
										.limit(parseInt(limit))
										.sort({createdAt: -1});


		const totalStudents = await Student.countDocuments(query);
		*/

		const [students, totalStudents] = await Promise.all([
			Student.find(query)
				.select('-password')
				.skip(skip)
				.limit(parseInt(limit))
				.sort({ createdAt: -1 }),

			Student.countDocuments(query)
		]);
		const totalPages = Math.ceil(totalStudents / parseInt(limit));

		const response = {
			students,
			currentPage: parseInt(page),
			totalPages,
			totalStudents
		};


		// STORE CACHE
		await redisClient.setEx(
			cacheKey,
			300,
			JSON.stringify(response)
		);

		res.json(response);

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
}

//GET Get student by Id
exports.getStudentById = async (req, res) => {
	try {

		const cacheKey = `student:${req.params.id}`;

		// CHECK CACHE
		const cachedStudent = await redisClient.get(cacheKey);

		if (cachedStudent)
			return res.json(JSON.parse(cachedStudent));
		

		const student = await Student.findById(req.params.id)
												.select('-password');

		if (!student)
			return res.status(400).json({ message: 'Student not found' });

		const response = { student };

		// STORE CACHE
		await redisClient.setEx(
			cacheKey,
			300,
			JSON.stringify(response)
		);

		res.json(response);

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};

//GET  Get student by access code
exports.getStudentByAccess = async (req, res) => {
	try {

		const { access_code } = req.params;

		const cacheKey = `student_access:${access_code}`;

		// CHECK CACHE
		const cachedStudent = await redisClient.get(cacheKey);

		if (cachedStudent)
			return res.json(JSON.parse(cachedStudent));



		if (!access_code)
			return res.status(400).json({ message: 'Access code is required' });

		const student = await Student.findOne({ access_code })
											.select('-password');

		if(!student)
			return res.status(400).json({ message: 'Student not found' });

		const response = { student };

		// STORE CACHE
		await redisClient.setEx(
			cacheKey,
			300,
			JSON.stringify(response)
		);

		res.json(response);

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};

//PUT  Update student record
// Update Student
exports.updateStudent = async (req, res) => {

	try {

		const { identifier } = req.params;

		let student;

		// Check if identifier is MongoDB ObjectId
		if (mongoose.Types.ObjectId.isValid(identifier)) {

			student = await Student.findById(identifier);

		} else {
			// Otherwise search by access code
			student = await Student.findOne({ access_code: identifier });
		}

		if (!student) 
			return res.status(404).json({ message: 'Student not found' });
		

		const { surname, firstname, email, class: studentClass, department } = req.body;

		// Update fields
		if (surname)
			student.surname = surname;
		if (firstname)
			student.firstname = firstname;
		if (email)
			student.email = email;
		if (studentClass)
			student.class = studentClass;
		if (department)
			student.department = department;

		await student.save();

		//Invalidate redis cache
		await redisClient.del(`student:${student._id}`);
		await redisClient.del(`student_access:${student.access_code}`);

		//Invalidate student list
		const keys = await redisClient.keys('students:*');

		if (keys.length > 0)
			await redisClient.del(keys);

		

		res.status(200).json({
			message: 'Student updated successfully',
			student
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};

//DELETE  Delete student record using access code and id
// Delete Student
exports.deleteStudent = async (req, res) => {

	try {

		const { identifier } = req.params;

		let student;

		// Check for MongoDB ID
		if (mongoose.Types.ObjectId.isValid(identifier)) {

			student = await Student.findById(identifier);

		} else {

			// Search by access code
			student = await Student.findOne({ access_code: identifier });
		}

		if (!student) 
			return res.status(404).json({ message: 'Student not found' });


		await student.deleteOne();

		//Invalidate redis cache
		await redisClient.del(`student:${student._id}`);
		await redisClient.del(`student_access:${student.access_code}`);


		//Invalidate student list
		const keys = await redisClient.keys('students:*');

		if (keys.length > 0)
			await redisClient.del(keys);

		res.status(200).json({ message: 'Student deleted successfully' });

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};