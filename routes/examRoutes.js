//routes/examRoutes.js

const express = require('express');
const router = express.Router();

const { createExam, getExam,
	getAllExams, updateExam, deleteExam
} = require('../controllers/examController');

const { protect, staffProtect } = require('../middleware/authMiddleware');

const {
    studentAuth
} = require('../middleware/studentAuth');

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Examination Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Exam:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6651a8b9d4f3c2a1b6e7f890
 *         title:
 *           type: string
 *           example: Mathematics First Term Examination
 *         subject:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *               example: Mathematics
 *             code:
 *               type: string
 *               example: MTH101
 *         instructions:
 *           type: string
 *           example: Answer all questions
 *         duration:
 *           type: number
 *           example: 60
 *         maxQuestions:
 *           type: number
 *           example: 100
 *         totalMarks:
 *           type: number
 *           example: 100
 *         isActive:
 *           type: boolean
 *           example: false
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             surname:
 *               type: string
 *             firstname:
 *               type: string
 *             email:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateExamInput:
 *       type: object
 *       required:
 *         - title
 *         - subjectIdentifier
 *       properties:
 *         title:
 *           type: string
 *           example: Mathematics First Term Examination
 *         subjectIdentifier:
 *           type: string
 *           example: MTH101
 *           description: Subject code or MongoDB ID
 *         instructions:
 *           type: string
 *           example: Answer all questions
 *         duration:
 *           type: number
 *           example: 60
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: 2026-06-01T08:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: 2026-06-01T10:00:00.000Z
 *
 *     UpdateExamInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Updated Mathematics Examination
 *         subject:
 *           type: string
 *           example: MTH101
 *           description: Subject code or MongoDB ID
 *         instructions:
 *           type: string
 *           example: Attempt all questions
 *         duration:
 *           type: number
 *           example: 90
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: 2026-06-01T08:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: 2026-06-01T10:00:00.000Z
 */

/**
 * @swagger
 * /api/exams:
 *   post:
 *     summary: Create an exam
 *     tags: [Exams]
 *     description: Only authenticated staff can create exams.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExamInput'
 *     responses:
 *       201:
 *         description: Exam created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam created successfully
 *                 exam:
 *                   $ref: '#/components/schemas/Exam'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get all exams
 *     tags: [Exams]
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
 *         description: Number of exams per page
 *
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *           example: Mathematics First Term Examination
 *         description: Filter by exam title
 *
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *           example: MTH101
 *         description: Filter by subject
 *
 *     responses:
 *       200:
 *         description: Exams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exam'
 *                 Page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalExams:
 *                   type: integer
 *                   example: 50
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6651a8b9d4f3c2a1b6e7f890
 *         description: Exam MongoDB ID
 *     responses:
 *       200:
 *         description: Exam retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update exam
 *     tags: [Exams]
 *     description: Update an exam using MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6651a8b9d4f3c2a1b6e7f890
 *         description: Exam MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExamInput'
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam updated successfully
 *                 exam:
 *                   $ref: '#/components/schemas/Exam'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exam or subject not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete exam
 *     tags: [Exams]
 *     description: Delete an exam using MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6651a8b9d4f3c2a1b6e7f890
 *         description: Exam MongoDB ID
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exaam deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */




// Create Exam
router.post(
	'/',
	protect,
	staffProtect,
	createExam
);

// Get All Exams
router.get(
	'/',
	protect,
	staffProtect,
	getAllExams
);

// Get Exam By ID
router.get(
	'/:id',
	studentAuth,
	getExam
);

// Update Exam
router.put(
	'/:id',
	protect,
	staffProtect,
	updateExam
);

// Delete Exam
router.delete(
	'/:id',
	protect,
	staffProtect,
	deleteExam
);

module.exports = router;