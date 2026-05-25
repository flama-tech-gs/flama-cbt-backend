//controllers/questionController.js

const mongoose = require('mongoose');
const Exam = require('../models/exam');
const Question = require('../models/question');
const redisClient = require('../config/redis');


// Add Question
exports.addQuestion = async (req, res) => {
	try {

		const { examId, question,
			options,correctAnswer, marks
		} = req.body;

		if ( !examId || !question || !options || !correctAnswer )
			return res.status(400).json({ message: 'All fields are required' });

		// Check Exam
		const exam = await Exam.findById(examId);

		if (!exam) 
			return res.status(404).json({ message: 'Exam not found' });

		// Count existing questions in an exam
		const questionCount = await Question.countDocuments({ exam: examId });

		// Limit to 100
		if ( questionCount >= exam.maxQuestions ) 
			return res.status(400).json({ message: 'Maximum question limit reached' });
		
		//Create question
		const newQuestion = await Question.create({
			exam: examId,
			question,
			options,
			correctAnswer,
			marks
		});

		// Invalidate cache
		await redisClient.del(`question:${newQuestion._id}`);

		const keys = await redisClient.keys('questions:*');

		if (keys.length > 0)
			await redisClient.del(keys);

		res.status(201).json({
			message: 'Question added successfully',
			question: newQuestion
		});

	} catch (err) {
		  res.status(500).json({ message: 'Internal Server Error'});
	}
};


//Get Question
exports.getQuestion = async (req, res) => {
	try {

		const cacheKey = `question:${req.params.id}`;

		// CHECK CACHE
		const cachedQuestion = await redisClient.get(cacheKey);

		if (cachedQuestion)
			return res.json(JSON.parse(cachedQuestion));

		const question = await Question.findById(req.params.id)
									.select('-correctAnswer');

		if (!question)
			return res.status(404).json({ message: 'Question not found' });

		const response = { question };

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


//Get ALL question
exports.getAllQuestions = async (req, res) => {
	try {
		const {page = 1, limit = 10, question } = req.query;
		
		const cacheKey = `questions:${page}:${limit}:${question || 'all'}`;

		// CHECK CACHE
		const cachedQuestions = await redisClient.get(cacheKey);

		if (cachedQuestions)
			return res.json(JSON.parse(cachedQuestions));

		const query = {};   //for filtering

		if (question) {
	      query.question = question; //  filtering
	    }

		const skip = (page - 1) * limit;

		const questions = await Question.find(query)
										.select('-correctAnswer')
		 								.skip(skip)
		 								.limit(parseInt(limit))
		 								.sort({createdAt: -1});

		const totalQuestion = await Question.countDocuments(query);

		const totalPages = Math.ceil( totalQuestion / limit);

		const response = {
			questions,
			Page: parseInt(page),
			totalPages,
			totalQuestion
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


//UPDATE update question
exports.updateQuestion = async (req, res) => {
	try {
		const questionData = await Question.findById(req.params.id);

		if(!questionData)
			return res.status(404).json({ message: 'Question not found'});

		const { question, options, correctAnswer, marks } = req.body;

		//Update
		if(question)
			questionData.question = question;
		if(options)
			questionData.options = options;
		if (correctAnswer)
			questionData.correctAnswer = correctAnswer;
		if (marks)
			questionData.marks = marks;

		await questionData.save();

		// Invalidate cache
		await redisClient.del( `question:${questionData._id}` );

		const keys = await redisClient.keys('questions:*');

		if (keys.length > 0)
			await redisClient.del(keys);

		res.status(200).json({
			message: 'Question updated successfully',
			question: questionData
		});

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};

//DELETE   Delete question
exports.deleteQuestion = async (req, res) => {
	try {
		const question = await Question.findById(req.params.id);

		if(!question)
			return res.status(404).json({ message: 'Question not found' });

		//Delete report
		await question.deleteOne();

		// Invalidate cache
		await redisClient.del(`question:${question._id}`);

		const keys = await redisClient.keys('questions:*');

		if (keys.length > 0)
			await redisClient.del(keys);

		res.status(200).json({ message: 'Question deleted successfully' });

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};