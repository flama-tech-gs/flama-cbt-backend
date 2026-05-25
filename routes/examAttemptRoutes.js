// routes/examAttemptRoutes.js

const express = require('express');

const router = express.Router();

const {
	startExam,
	submitExam,
	getStudentAttempts,
	getAttempt,
	updateAttemptAnswer
} = require('../controllers/examAttemptController');

const {
	protect
} = require('../middleware/authMiddleware');




/**
 * @swagger
 * tags:
 *   name: Exam Attempts
 *   description: Student Exam Attempt APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AttemptAnswer:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           example: 6652b7c8d9e0f1a2b3c4d567
 *         selectedAnswer:
 *           type: string
 *           example: Abuja
 *         isCorrect:
 *           type: boolean
 *           example: true
 *         marksAwarded:
 *           type: number
 *           example: 1
 *
 *     ExamAttempt:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6653c7d8e9f0a1b2c3d4e567
 *         student:
 *           type: string
 *           example: 6650c8f7d2f3a4b5c6d7e890
 *         exam:
 *           type: string
 *           example: 6651a8b9d4f3c2a1b6e7f890
 *         answers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AttemptAnswer'
 *         startedAt:
 *           type: string
 *           format: date-time
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         score:
 *           type: number
 *           example: 25
 *         isSubmitted:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     StartExamInput:
 *       type: object
 *       required:
 *         - examId
 *       properties:
 *         examId:
 *           type: string
 *           example: 6651a8b9d4f3c2a1b6e7f890
 *
 *     SubmitExamInput:
 *       type: object
 *       required:
 *         - attemptId
 *         - answers
 *       properties:
 *         attemptId:
 *           type: string
 *           example: 6653c7d8e9f0a1b2c3d4e567
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 example: 6652b7c8d9e0f1a2b3c4d567
 *               selectedAnswer:
 *                 type: string
 *                 example: Abuja
 *
 *     UpdateAttemptAnswerInput:
 *       type: object
 *       required:
 *         - attemptId
 *         - questionId
 *         - selectedAnswer
 *       properties:
 *         attemptId:
 *           type: string
 *           example: 6653c7d8e9f0a1b2c3d4e567
 *         questionId:
 *           type: string
 *           example: 6652b7c8d9e0f1a2b3c4d567
 *         selectedAnswer:
 *           type: string
 *           example: Abuja
 */

/**
 * @swagger
 * /api/exam-attempts/start:
 *   post:
 *     summary: Start an exam
 *     tags: [Exam Attempts]
 *     description: Allows a student to start an exam attempt.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartExamInput'
 *     responses:
 *       201:
 *         description: Exam started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam started successfully
 *                 attempt:
 *                   $ref: '#/components/schemas/ExamAttempt'
 *       400:
 *         description: Exam already submitted or invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/exam-attempts/submit:
 *   post:
 *     summary: Submit exam attempt
 *     tags: [Exam Attempts]
 *     description: Submit answers and calculate exam score.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitExamInput'
 *     responses:
 *       200:
 *         description: Exam submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam submitted successfully
 *                 score:
 *                   type: number
 *                   example: 45
 *                 attempt:
 *                   $ref: '#/components/schemas/ExamAttempt'
 *       400:
 *         description: Validation error or exam already submitted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attempt not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/exam-attempts/my-attempts:
 *   get:
 *     summary: Get logged-in student attempts
 *     tags: [Exam Attempts]
 *     description: Retrieve all attempts belonging to the authenticated student.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attempts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamAttempt'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/exam-attempts/{id}:
 *   get:
 *     summary: Get single exam attempt
 *     tags: [Exam Attempts]
 *     description: Retrieve a single exam attempt with answers and exam details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6653c7d8e9f0a1b2c3d4e567
 *         description: Exam attempt MongoDB ID
 *     responses:
 *       200:
 *         description: Attempt retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamAttempt'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attempt not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/exam-attempts/update-answer:
 *   put:
 *     summary: Update attempt answer
 *     tags: [Exam Attempts]
 *     description: Update or add a student's answer before exam submission.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttemptAnswerInput'
 *     responses:
 *       200:
 *         description: Answer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer updated successfully
 *                 score:
 *                   type: number
 *                   example: 20
 *                 attempt:
 *                   $ref: '#/components/schemas/ExamAttempt'
 *       400:
 *         description: Validation error or exam already submitted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Attempt or question not found
 *       500:
 *         description: Internal server error
 */



// Start Exam
router.post(
	'/start',
	protect,
	startExam
);

// Submit Exam
router.post(
	'/submit',
	protect,
	submitExam
);

// Get Student Attempts
router.get(
	'/my-attempts',
	protect,
	getStudentAttempts
);

// Get Single Attempt
router.get(
	'/:id',
	protect,
	getAttempt
);

// Update Answer
router.put(
	'/update-answer',
	protect,
	updateAttemptAnswer
);

module.exports = router;