//controllers/subjectController.js

const mongoose = require('mongoose');
const Subject = require('../models/subject');
const User = require('../models/User');
const Student = require('../models/student');
const redisClient = require('../config/redis');

// Create Subject
exports.createSubject = async (req, res) => {
	try {
		const { name, code, description, 
		class: subjectClass,teacher
		} = req.body;

		if ( !name || !code || !subjectClass || !teacher) 
			return res.status(400).json({ message: 'All required fields are needed' });
		
		// Check existing subject (subject code)
		const existingSubject = await Subject.findOne({ code });

		if (existingSubject) 
			return res.status(400).json({ message: 'Subject code already exists' });

		// Check teacher
		let teacherExists;

		// Search teacher by ID 
		if (mongoose.Types.ObjectId.isValid(teacher)) {
			teacherExists = await User.findById(teacher);
		} else {
			//Search teacher by Email
			teacherExists = await User.findOne({ email: teacher });
		}

		if (!teacherExists) 
			return res.status(404).json({ message: 'Teacher not found' });


		// Validate role
		if (teacherExists.role !== 'teacher') 
			return res.status(400).json({ message: 'Assigned user is not a teacher' });

		const subject = await Subject.create({
			name,
			code,
			description,
			class: subjectClass,
			teacher: teacherExists._id
		});


		// CLEAR SUBJECT LIST CACHE
		const keys = await redisClient.keys('subjects:*');

		if (keys.length > 0)
			await redisClient.del(keys);


		res.status(201).json({
			message: 'Subject created successfully',
			subject
		});

	} catch (err) {
			console.error("CREATE SUBJECT ERROR:", err);
    res.status(500).json({
        message: err.message,
        stack: err.stack
    });
	}
};

//Get  get a subject by id or subject code
exports.getSubject = async (req, res) => {
	try {
		const { identifier } = req.params;

		const cacheKey = `subject:${identifier}`;

		// CHECK CACHE
		const cachedSubject = await redisClient.get(cacheKey);

		if (cachedSubject)
			return res.json(JSON.parse(cachedSubject));

		let subject;

		//chech with mongoDB id
		if (mongoose.Types.ObjectId.isValid(identifier)) {
			subject = await Subject.findById(identifier)
									.populate('teacher', 'surname firstname email')
									.populate('students', 'surname firstname access_code');
		} else {
			// check by subject code
			subject = await Subject.findOne({ code: identifier })
									.populate('teacher', 'surname firstname email')
									.populate('students', 'surname firstname access_code');
		}

		if(!subject)
			return res.status(404).json({ message: 'Subject not found'});

		const response = { subject };

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

// Get All Subjects
exports.getAllSubjects = async (req, res) => {
	try {
		const { page = 1, limit = 10, name, code, class: subjectClass } = req.query;
		
		const cacheKey = `subjects:${page}:${limit}:${name || 'all'}:${code || 'all'}:${subjectClass || 'all'}`;

		// CHECK CACHE
		const cachedSubjects = await redisClient.get(cacheKey);

		if (cachedSubjects)
			return res.json(JSON.parse(cachedSubjects));

		const query = {};  //for filtering

		if (name)
			query.name = name;
		if ( code )
			query.code = code;
		if (subjectClass)
			query.class = subjectClass;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const subjects = await Subject.find(query)
								.populate( 'teacher', 'surname firstname email' )
								.populate( 'students', 'surname firstname access_code' )
								.skip(skip)
								.limit(parseInt(limit))
								.sort({createdAt: -1});

		const totalSubjects = await Subject.countDocuments(query);
		const totalPages = Math.ceil(totalSubjects / limit);

		const response = {
			subjects,
			currentPage: parseInt(page),
			totalPages,
			totalSubjects
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
};


//Update Update subject by id and code
exports.updateSubject = async (req, res) => {
	try {

		const { identifier } = req.params;

		let subject;

		// Check if identifier is MongoDB ObjectId
		if (mongoose.Types.ObjectId.isValid (identifier)) {
			subject = await Subject.findById(identifier);

		} else {
			//Search by subject code
			subject = await Subject.findOne({ code: identifier });
		}

		if (!subject)
			return res.status(404).json({ message: 'Subject not found' });

		const { name, description, class: subjectClass, teacher, student } = req.body;

		// Update Fields
		if (name)
			subject.name = name;
		if(description)
			subject.description = description;
		if(subjectClass)
			subject.class = subjectClass;
		if(teacher) {
			let teacherExists;

			if (mongoose.Types.ObjectId.isValid(teacher)) {
				teacherExists = await User.findById(teacher);
			} else {
				teacherExists = await User.findOne({ email: teacher });
			}
			
			if (!teacherExists)
				return res.status(404).json({ message: 'Teacher not found'});

			//Update teacher
			subject.teacher = teacherExists._id;
		}

		if(student) {
			let studentExists;

			//find students by id
			if(mongoose.Types.ObjectId.isValid(student)){
				studentExists = await Student.findById(student);
			} else {

				//find student by access code
				studentExists = await Student.findOne({ access_code: student });
			}

			if(!studentExists)
				return res.status(404).json({ message: 'Student not found'});
			
			//Update student
			//subject.student = studentExists._id;
			subject.students.push(studentExists._id);
		}

		await subject.save();

		// CLEAR SINGLE SUBJECT CACHE
		await redisClient.del(`subject:${subject._id}`);
		await redisClient.del(`subject:${subject.code}`);

		// CLEAR SUBJECT LIST CACHE
		const keys = await redisClient.keys('subjects:*');

		if (keys.length > 0)
			await redisClient.del(keys);

		res.status(200).json ({
			message: 'Subject Updated successfully',
			subject
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};


//DELETE  Delete subject using code and id
// Delete Subject
exports.deleteSubject = async (req, res) => {

	try {

		const { identifier } = req.params;

		let subject;

		// Check for MongoDB ID
		if (mongoose.Types.ObjectId.isValid(identifier)) {

			subject = await Subject.findById(identifier);

		} else {

			// Search by subject code
			subject = await Subject.findOne({ code: identifier });
		}

		if (!subject) 
			return res.status(404).json({ message: 'Subject not found' });

		await subject.deleteOne();

		// CLEAR SINGLE SUBJECT CACHE
		await redisClient.del(`subject:${subject._id}`);
		await redisClient.del(`subject:${subject.code}`);

		// CLEAR SUBJECT LIST CACHE
		const keys = await redisClient.keys('subjects:*');

		if (keys.length > 0)
			await redisClient.del(keys);

		res.status(200).json({ message: 'Subject deleted successfully' });

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};



//POST  Add subject to student
exports.addStudentToSubject = async (req, res) => {

	try {

		const { subjectIdentifier, studentIdentifier } = req.body;

		if (!subjectIdentifier || !studentIdentifier )
			return res.status(404).json({ message: 'All fileds are required' });

		//Find Subject
		let subject;

		//search subject by id
		if(mongoose.Types.ObjectId.isValid (subjectIdentifier)) {
			subject = await Subject.findById(subjectIdentifier);
		} else {
			//search subject by subject code
			subject = await Subject.findOne({ code: subjectIdentifier });
		}

		if (!subject)
			return res.status(404).json({ message: 'Subject not found' });

		//Find Student
		let student;

		//Search student by id
		if (mongoose.Types.ObjectId.isValid (studentIdentifier)) {
			student = await Student.findById(studentIdentifier);
		} else {
			//search student by access_code
			student = await Student.findOne({ access_code: studentIdentifier });
		}

		if (!student)
			return res.status(404).json({ message: 'Student not found' });

		// Prevent duplicate enrollment
		if (
			//if the subject already has student id
			subject.students.includes(student._id)
		) {

			return res.status(400).json({ message: `Student already enrolled for ${subject}` });
		}

		//add student to subject
		subject.students.push(student._id);

		await subject.save();

		// CLEAR SUBJECT CACHE
		await redisClient.del(`subject:${subject._id}`);
		await redisClient.del(`subject:${subject.code}`);

		// CLEAR SUBJECT LIST CACHE
		const keys = await redisClient.keys('subjects:*');

		if (keys.length > 0)
			await redisClient.del(keys);

		// CLEAR STUDENT SUBJECTS CACHE
		const studentSubjectKeys =
			await redisClient.keys(`student_subjects:${student._id}:*`);

		if (studentSubjectKeys.length > 0)
			await redisClient.del(studentSubjectKeys);

		res.status(200).json({
			message: 'Student added successfully',
			subject
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};


//Get Get all subject related to a student
exports.getStudentSubjects = async (req, res) => {

	try {
		const { studentIdentifier } = req.params;

		const { page = 1, limit = 10 } = req.query;

		const cacheKey = `student_subjects:${studentIdentifier}:${page}:${limit}`;

		// CHECK CACHE
		const cachedSubjects = await redisClient.get(cacheKey);

		if (cachedSubjects)
			return res.json(JSON.parse(cachedSubjects));

		const query = {};  //for filtering

		const skip = (parseInt(page) - 1) * parseInt(limit);

		let student;

		// Search by ID
		if ( mongoose.Types.ObjectId.isValid(studentIdentifier )) {

			student = await Student.findById( studentIdentifier );
		} else {
			student = await Student.findOne({ access_code: studentIdentifier });
		}

		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		const subjects = await Subject.find({ students: student._id })
										.populate( 'teacher', 'surname firstname' )
										.skip(skip)
										.limit(parseInt(limit));
	

		const totalSubjects = await Subject.countDocuments({ students: student._id });

		const totalPages = Math.ceil(totalSubjects / limit);
		
		const response = {
			subjects,
			totalSubjects,
			totalPages,
			currentPage: parseInt(page)
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
};