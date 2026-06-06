// controllers/examAttemptController.js

const ExamAttempt = require('../models/examAttempt');
const Exam = require('../models/exam');
const Question = require('../models/question');
const redisClient = require('../config/redis');


const getCache = async (key) => {
	const data = await redisClient.get(key);
	return data ? JSON.parse(data) : null;
};

const setCache = async (key, data, ttl = 300) => {
	await redisClient.setEx(key, ttl, JSON.stringify(data));
};

const deleteCache = async (key) => {
	await redisClient.del(key);
};


// START EXAM
exports.startExam = async (req, res) => {

	try {

		const { examId } = req.body;

		if (!examId)
			return res.status(400).json({ message: 'Exam ID is required' });

		// Check exam
		const exam = await Exam.findById(examId);

		if (!exam)
			return res.status(404).json({ message: 'Exam not found' });

		// Check if already attempted
		const existingAttempt = await ExamAttempt.findOne({
			exam: examId,
			student: req.user._id,
			isSubmitted: false
		});

		if (existingAttempt)
			return res.status(400).json({ message: 'You already have an active attempt' });

		//validate schedule exam
		const now = new Date();

		if (!exam.isActive) 
		    return res.status(400).json({
		        message: 'Exam is not active'
		    });
		

		if (exam.startDate && now < exam.startDate) 
		    return res.status(400).json({
		        message: 'Exam has not started'
		    });
		

		if (exam.endDate && now > exam.endDate) 
		    return res.status(400).json({
		        message: 'Exam has ended'
		    });
		


		// Create attempt
		const attempt = await ExamAttempt.create({
			student: req.user._id,
			exam: examId,
			remainingTime: exam.duration * 60
		});

		//REDIS INVALIDATION
		await deleteCache(`student-attempts:${req.user._id}`);

		res.status(201).json({
			message: 'Exam started successfully',
			attempt
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};



// SUBMIT EXAM
exports.submitExam = async (req, res) => {

	try {

		const { attemptId, answers } = req.body;

		/*
			answers format:

			[
				{
					questionId: "...",
					selectedAnswer: "A"
				}
			]
		*/

		if (!attemptId || !answers || !Array.isArray(answers) || answers.length === 0 )
			return res.status(400).json({ message: 'Attempt ID and answers are required' });

		// Find attempt
		const attempt = await ExamAttempt.findOne({
										_id: attemptId,
										student: req.user._id
									});

		if (!attempt)
			return res.status(404).json({ message: 'Attempt not found' });

		// Prevent resubmission
		if (attempt.isSubmitted)
			return res.status(400).json({ message: 'Exam already submitted' });

		// Extract all question IDs
		const questionIds = answers.map( (ans) => ans.questionId );

		// Fetch all questions once
		const questions = await Question.find({ 
			_id: { $in: questionIds },
			exam: attempt.exam
		});


		// Create question map for fast lookup
		const questionMap = {};

		questions.forEach((question) => {
			questionMap[question._id.toString()] = question;
		});

		let totalScore = 0;

		const processedAnswers = [];


		// Loop through answers
		for (const ans of answers) {

			//find answer of question
			const question = questionMap[ans.questionId];

			// Skip invalid question IDs
			if (!question)
				continue;

			const isCorrect = question.correctAnswer === ans.selectedAnswer;

			const marksAwarded =
				isCorrect ? question.marks : 0;

			totalScore += marksAwarded;

			processedAnswers.push({
				question: question._id,
				selectedAnswer: ans.selectedAnswer,
				isCorrect,
				marksAwarded
			});
		}
		

		// Save attempt
		attempt.answers = processedAnswers;
		attempt.score = totalScore;
		attempt.submittedAt = new Date();
		attempt.isSubmitted = true;

		await attempt.save();

		// clear student attempts cache
		await deleteCache(`student-attempts:${attempt.student}`);

		// clear attempt cache
		await deleteCache(`attempt:${attempt.student}:${attempt._id}`);

		res.status(200).json({
			message: 'Exam submitted successfully',
			score: totalScore,
			attempt
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};



// GET STUDENT ATTEMPTS
exports.getStudentAttempts = async (req, res) => {

	try {

		const cacheKey = `student-attempts:${req.user._id}`;

		// 1. check cache first
		const cached = await getCache(cacheKey);
		if (cached) {
			return res.json({
				source: 'cache',
				attempts: cached
			});
		}

		// 2. DB query
		const attempts = await ExamAttempt.find({ student: req.user._id })
											.populate('exam', 'title')
											.sort({ createdAt: -1 });

		// 3. save to cache (5 mins)
		await setCache(cacheKey, attempts, 300);

		res.json({
			source: 'db',
			attempts
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};



// GET SINGLE ATTEMPT
exports.getAttempt = async (req, res) => {

	try {
		const cacheKey = `attempt:${req.user._id}:${req.params.id}`;

		// check cache
		const cached = await getCache(cacheKey);
		if (cached) {
			return res.json({
				source: 'cache',
				attempt: cached
			});
		}

		const attempt = await ExamAttempt.findOne({ _id: req.params.id,
												student: req.user._id })
												.populate('exam')
												.populate('student', 'surname firstname access_code')
												.populate({
													path: 'answers.question',
													select: 'question options marks'
												});

		if (!attempt)
			return res.status(404).json({ message: 'Attempt not found' });

		// store cache (10 mins)
		await setCache(cacheKey, attempt, 600);

		res.json({
			source: 'db',
			attempt
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};


// UPDATE ATTEMPT ANSWER
exports.updateAttemptAnswer = async (req, res) => {

	try {

		const { attemptId, questionId, selectedAnswer } = req.body;

		if (!attemptId || !questionId || !selectedAnswer)
			return res.status(400).json({ message: 'All fields are required' });

		// Find attempt
		const attempt = await ExamAttempt.findById(attemptId);

		if (!attempt)
			return res.status(404).json({ message: 'Attempt not found' });

		// Prevent update after submission
		if (attempt.isSubmitted)
			return res.status(400).json({ message: 'Exam already submitted' });

		// Check ownership
		if (attempt.student.toString() !== req.user._id.toString())
			return res.status(403).json({ message: 'Not authorized' });

		// Find question
		const question = await Question.findById(questionId);

		if (!question)
			return res.status(404).json({ message: 'Question not found' });

		// Check if answer already exists
		const existingAnswer = attempt.answers.find(
			(ans) =>
				ans.question.toString() === questionId
		);

		const isCorrect =
			question.correctAnswer === selectedAnswer;

		const marksAwarded =
			isCorrect ? question.marks : 0;

		// Update existing answer
		if (existingAnswer) {

			existingAnswer.selectedAnswer = selectedAnswer;
			existingAnswer.isCorrect = isCorrect;
			existingAnswer.marksAwarded = marksAwarded;

		} else {

			// Add new answer
			attempt.answers.push({
				question: question._id,
				selectedAnswer,
				isCorrect,
				marksAwarded
			});
		}

		// Recalculate score
		let totalScore = 0;

		attempt.answers.forEach((answer) => {
			totalScore += answer.marksAwarded;
		});

		attempt.score = totalScore;

		await attempt.save();

		//REDIS INVALIDATION
		await deleteCache(`student-attempts:${attempt.student}`);
		await deleteCache(`attempt:${attempt._id}`);

		res.status(200).json({
			message: 'Answer updated successfully',
			score: totalScore,
			attempt
		});

	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error'});
	}
};



//Get question attempt i related to exam
exports.getActiveAttempt = async (req, res) => {

    try {

        const { examId } = req.params;

        const attempt =
            await ExamAttempt.findOne({
                exam: examId,
                student: req.user._id,
                isSubmitted: false
            });

        if (!attempt) {
            return res.status(404).json({
                message: "No active attempt"
            });
        }

        res.json({
            attempt
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


// save time 
exports.saveRemainingTime = async (req, res) => {
    try {

        const {
            attemptId,
            remainingTime
        } = req.body;

        const attempt =
		  await ExamAttempt.findOne({
		    _id: attemptId,
		    student: req.user._id
		  });

        if (!attempt)
            return res.status(404).json({
                message: "Attempt not found"
            });

        attempt.remainingTime =
            remainingTime;

        await attempt.save();

        res.json({
            message: "Time saved"
        });

    } catch (err) {

        res.status(500).json({
            message: "Internal Server Error"
        });

    }
};