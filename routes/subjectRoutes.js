//routes/subjectRoutes.js
const express = require('express');
const router = express.Router();

const {
	createSubject, getSubject, getAllSubjects, updateSubject, 
	deleteSubject, addStudentToSubject, getStudentSubjects 
	} = require('../controllers/subjectController');

const { protect, staffProtect } = require('../middleware/authMiddleware');




/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6650d9e4f1a2b3c4d5e6f789
 *         name:
 *           type: string
 *           example: Mathematics
 *         code:
 *           type: string
 *           example: MTH101
 *         description:
 *           type: string
 *           example: Basic Mathematics for Senior Secondary Students
 *         class:
 *           type: string
 *           example: SS2
 *         teacher:
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
 *         students:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               surname:
 *                 type: string
 *               firstname:
 *                 type: string
 *               access_code:
 *                 type: string
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateSubjectInput:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - class
 *         - teacher
 *       properties:
 *         name:
 *           type: string
 *           example: Mathematics
 *         code:
 *           type: string
 *           example: MTH101
 *         description:
 *           type: string
 *           example: Basic Mathematics
 *         class:
 *           type: string
 *           example: SS2
 *         teacher:
 *           type: string
 *           example: teacher@gmail.com
 *           description: Teacher email or MongoDB ID
 *
 *     UpdateSubjectInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Mathematics
 *         description:
 *           type: string
 *           example: Updated Mathematics Description
 *         class:
 *           type: string
 *           example: SS3
 *         teacher:
 *           type: string
 *           example: teacher@gmail.com
 *           description: Teacher email or MongoDB ID
 *         student:
 *           type: string
 *           example: STU-123456
 *           description: Student access code or MongoDB ID
 *
 *     EnrollStudentInput:
 *       type: object
 *       required:
 *         - subjectIdentifier
 *         - studentIdentifier
 *       properties:
 *         subjectIdentifier:
 *           type: string
 *           example: MTH101
 *           description: Subject code or MongoDB ID
 *         studentIdentifier:
 *           type: string
 *           example: STU-123456
 *           description: Student access code or MongoDB ID
 */

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a subject
 *     tags: [Subjects]
 *     description: Only authenticated staff can create subjects.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubjectInput'
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subject created successfully
 *                 subject:
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
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
 *         description: Number of subjects per page
 *
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           example: Mathematics
 *         description: Filter by subject name
 *
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *           example: MTH101
 *         description: Filter by subject code
 *
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *           example: SS2
 *         description: Filter by class
 *
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subjects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subject'
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalSubjects:
 *                   type: integer
 *                   example: 50
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/subjects/{identifier}:
 *   get:
 *     summary: Get subject by ID or code
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         example: MTH101
 *         description: Subject code or MongoDB ID
 *     responses:
 *       200:
 *         description: Subject retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update subject
 *     tags: [Subjects]
 *     description: Update subject details using subject code or MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         example: MTH101
 *         description: Subject code or MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubjectInput'
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subject Updated successfully
 *                 subject:
 *                   $ref: '#/components/schemas/Subject'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subject, teacher, or student not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete subject
 *     tags: [Subjects]
 *     description: Delete subject using subject code or MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         example: MTH101
 *         description: Subject code or MongoDB ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subject deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/subjects/enroll/student:
 *   post:
 *     summary: Add student to subject
 *     tags: [Subjects]
 *     description: Enroll a student into a subject using access code or MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollStudentInput'
 *     responses:
 *       200:
 *         description: Student added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student added successfully
 *                 subject:
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Student already enrolled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subject or student not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/subjects/student/{studentIdentifier}:
 *   get:
 *     summary: Get all subjects related to a student
 *     tags: [Subjects]
 *     description: Retrieve all subjects assigned to a student using access code or MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentIdentifier
 *         required: true
 *         schema:
 *           type: string
 *         example: STU-123456
 *         description: Student access code or MongoDB ID
 *
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
 *         description: Number of subjects per page
 *
 *     responses:
 *       200:
 *         description: Student subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */





// Create Subject
router.post('/', protect, staffProtect, createSubject );

// Get All Subjects
router.get('/', protect, staffProtect, getAllSubjects );

// Get Subject By ID or Code
router.get('/:identifier', protect, staffProtect, getSubject );

// Update Subject
router.put( '/:identifier', protect, staffProtect, updateSubject );

// Delete Subject
router.delete('/:identifier', protect, staffProtect, deleteSubject );

// Add Student To Subject
router.post( '/enroll/student', protect, staffProtect, addStudentToSubject );

// Get Subjects Related To Student
router.get( '/student/:studentIdentifier', protect, staffProtect, getStudentSubjects );

module.exports = router;