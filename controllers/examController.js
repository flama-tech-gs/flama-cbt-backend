//controllers/examController.js

const mongoose = require('mongoose');
const Exam = require('../models/exam');
const Subject = require('../models/subject');
const redisClient = require('../config/redis');

// Create Exam
exports.createExam = async (req, res) => {
	try {

		const { title, subjectIdentifier, instructions,
			duration, startDate, endDate
		 } = req.body;

		if (!title || !subjectIdentifier) 
			return res.status(400).json({ message: 'Title and subject are required' });

		// Check Subject
		let subjectExists;

		//search by subject id
		if(mongoose.Types.ObjectId.isValid(subjectIdentifier)) {
			subjectExists = await Subject.findById(subjectIdentifier);
		} else {
			//seach by subject code
			subjectExists = await Subject.findOne ({ code: subjectIdentifier });
		}
		
		if (!subjectExists) 
	
			return res.status(404).json({ message: 'Subject not found' });
		
		//Create Exam
		const exam = await Exam.create({
			title,
			subject: subjectExists._id,
			instructions,
			duration: duration || 60,
			startDate,
			endDate,
			createdBy: req.user._id
		});
	


		// CLEAR EXAM LIST CACHE
		const keys = await redisClient.keys('exams:*');

		if (keys.length > 0)
			await redisClient.del(keys);


		res.status(201).json({
			message: 'Exam created successfully',
			exam 
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};


//Get Exam by id
exports.getExam = async (req, res) => {
	try {

		const { id } = req.params;

		const cacheKey = `exam:${id}`;

		// CHECK CACHE
		const cachedExam = await redisClient.get(cacheKey);

		if (cachedExam)
			return res.json( JSON.parse(cachedExam) );
 
 		//Find exam
		const exam = await Exam.findById(req.params.id)
								.populate( 'subject', 'name code')
								.populate('createdBy', 'surname firstname email');

		if(!exam)
			return res.status(404).json ({ message: 'Exam not found' });

		const response = { exam };

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


//Get ALL exams
exports.getAllExams = async (req, res) => {
	try {
		const {page = 1, limit = 10, title, subject } = req.query;
		
		const cacheKey =
			`exams:${page}:${limit}:${title || 'all'}:${subject || 'all'}`;

		// CHECK CACHE
		const cachedExams = await redisClient.get(cacheKey);

		if (cachedExams)
			return res.json( JSON.parse(cachedExams) );

		const query = {};   //for filtering

		if (title) {
	      query.title = title; //  filtering
	    }
	    // Filter subject
		if (subject) {

			let subjectExists;

			if (mongoose.Types.ObjectId.isValid(subject)) {

				subjectExists = await Subject.findById(subject);

			} else {

				subjectExists = await Subject.findOne({ code: subject });
			}

			if (subjectExists)
				query.subject = subjectExists._id;
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);


		const exams = await Exam.find(query)
		 								.skip(skip)
		 								.populate('subject', 'name code')
										.populate('createdBy', 'surname firstname email')
		 								.limit(parseInt(limit))
		 								.sort({createdAt: -1});

		const totalExams = await Exam.countDocuments(query);

		const totalPages = Math.ceil( totalExams / limit);

		const response = {
			exams,
			Page: parseInt(page),
			totalPages,
			totalExams
		};

		// STORE CACHE
		await redisClient.setEx(
			cacheKey,
			300,
			JSON.stringify(response)
		);

		res.json(response);
 
	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//UPDATE update exam
exports.updateExam = async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);

		if(!exam)
			return res.status(404).json({ message: 'Exam not found'});

		const { title, subject, instructions,
			duration, startDate, endDate 
		} = req.body;

		//Update
		if(title)
			exam.title = title;
		if(instructions)
			exam.instructions = instructions;
		if(duration)
			exam.duration = duration;
		if(startDate)
			exam.startDate = startDate;
		if(endDate)
			exam.endDate = endDate;
		if(subject) {
			let subjectExists;

			if(mongoose.Types.ObjectId.isValid(subject)) {
				subjectExists = await Subject.findById(subject);
			} else {
				subjectExists = await Subject.findOne({ code: subject });
			}

			if (!subjectExists)
				return res.status(404).json({ message: 'Subject not found' });

			//update exam
			exam.subject = subjectExists._id;
		}

		await exam.save();

		// CLEAR SINGLE EXAM CACHE
		await redisClient.del( `exam:${exam._id}` );

		// CLEAR EXAM LIST CACHE
		const keys = await redisClient.keys('exams:*');

		if (keys.length > 0)
			await redisClient.del(keys);


		res.status(200).json({
			message: 'Exam updated successfully',
			exam
		});

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//DELETE   Delete exam
exports.deleteExam = async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);

		if(!exam)
			return res.status(404).json({ message: 'Exam not found' });

		//Delete report
		await exam.deleteOne();

		// CLEAR SINGLE EXAM CACHE
		await redisClient.del( `exam:${exam._id}` );

		// CLEAR EXAM LIST CACHE
		const keys = await redisClient.keys('exams:*');

		if (keys.length > 0)
			await redisClient.del(keys);

		res.status(200).json({ message: 'Exaam deleted successfully' });

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};