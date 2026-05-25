//routes/questionRoutes.js

const express = require('express');

const router = express.Router();

const { addQuestion, getQuestion,
	getAllQuestions, updateQuestion, deleteQuestion
} = require('../controllers/questionController');

const { protect, staffProtect } = require('../middleware/authMiddleware');





/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Question Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6652b7c8d9e0f1a2b3c4d567
 *         exam:
 *           type: string
 *           example: 6651a8b9d4f3c2a1b6e7f890
 *         question:
 *           type: string
 *           example: What is the capital of Nigeria?
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - Lagos
 *             - Abuja
 *             - Kano
 *             - Ibadan
 *         correctAnswer:
 *           type: string
 *           example: Abuja
 *         marks:
 *           type: number
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     QuestionResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         exam:
 *           type: string
 *         question:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: string
 *         marks:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     AddQuestionInput:
 *       type: object
 *       required:
 *         - examId
 *         - question
 *         - options
 *         - correctAnswer
 *       properties:
 *         examId:
 *           type: string
 *           example: 6651a8b9d4f3c2a1b6e7f890
 *         question:
 *           type: string
 *           example: What is the capital of Nigeria?
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - Lagos
 *             - Abuja
 *             - Kano
 *             - Ibadan
 *         correctAnswer:
 *           type: string
 *           example: Abuja
 *         marks:
 *           type: number
 *           example: 1
 *
 *     UpdateQuestionInput:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           example: Updated question text
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - Option A
 *             - Option B
 *             - Option C
 *             - Option D
 *         correctAnswer:
 *           type: string
 *           example: Option B
 *         marks:
 *           type: number
 *           example: 2
 */

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Add question to exam
 *     tags: [Questions]
 *     description: Only authenticated staff can add questions to an exam.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddQuestionInput'
 *     responses:
 *       201:
 *         description: Question added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question added successfully
 *                 question:
 *                   $ref: '#/components/schemas/Question'
 *       400:
 *         description: Validation error or maximum question limit reached
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Current page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of questions per page
 *
 *       - in: query
 *         name: question
 *         schema:
 *           type: string
 *           example: capital of Nigeria
 *         description: Filter by question text
 *
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuestionResponse'
 *                 Page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalQuestion:
 *                   type: integer
 *                   example: 50
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
 *     description: Retrieve a question without exposing the correct answer.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6652b7c8d9e0f1a2b3c4d567
 *         description: Question MongoDB ID
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update question
 *     tags: [Questions]
 *     description: Update a question using MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6652b7c8d9e0f1a2b3c4d567
 *         description: Question MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestionInput'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question updated successfully
 *                 question:
 *                   $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete question
 *     tags: [Questions]
 *     description: Delete a question using MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6652b7c8d9e0f1a2b3c4d567
 *         description: Question MongoDB ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 */





// Add Question
router.post(
	'/',
	protect,
	staffProtect,
	addQuestion
);

// Get All Questions
router.get(
	'/',
	protect,
	staffProtect,
	getAllQuestions
);

// Get Question By ID
router.get(
	'/:id',
	protect,
	staffProtect,
	getQuestion
);

// Update Question
router.put(
	'/:id',
	protect,
	staffProtect,
	updateQuestion
);

// Delete Question
router.delete(
	'/:id',
	protect,
	staffProtect,
	deleteQuestion
);

module.exports = router;