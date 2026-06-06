//routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const {
	createStudent, getAllStudents, getStudentById,
	getStudentByAccess, updateStudent, deleteStudent, 
	getMyProfile
} = require('../controllers/studentController');
const { protect, staffProtect } = require('../middleware/authMiddleware');

const {
    studentAuth
} = require('../middleware/studentAuth');

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6650c8f7d2f3a4b5c6d7e890
 *         surname:
 *           type: string
 *           example: Adeyemi
 *         firstname:
 *           type: string
 *           example: David
 *         email:
 *           type: string
 *           example: david@gmail.com
 *         access_code:
 *           type: string
 *           example: STU-123456
 *         class:
 *           type: string
 *           example: SS3
 *         department:
 *           type: string
 *           example: Science
 *         role:
 *           type: string
 *           example: student
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
 *     CreateStudentInput:
 *       type: object
 *       required:
 *         - surname
 *         - firstname
 *         - class
 *       properties:
 *         surname:
 *           type: string
 *           example: Adeyemi
 *         firstname:
 *           type: string
 *           example: David
 *         email:
 *           type: string
 *           example: david@gmail.com
 *         class:
 *           type: string
 *           example: SS3
 *         department:
 *           type: string
 *           example: Science
 *
 *     UpdateStudentInput:
 *       type: object
 *       properties:
 *         surname:
 *           type: string
 *           example: Adeyemi
 *         firstname:
 *           type: string
 *           example: David
 *         email:
 *           type: string
 *           example: david@gmail.com
 *         class:
 *           type: string
 *           example: SS3
 *         department:
 *           type: string
 *           example: Science
 *
 *     StudentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Student Created Successfully
 *         _id:
 *           type: string
 *         surname:
 *           type: string
 *         firstname:
 *           type: string
 *         email:
 *           type: string
 *         class:
 *           type: string
 *         department:
 *           type: string
 *         access_code:
 *           type: string
 *         password:
 *           type: string
 *           example: adeyemi
 */

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create a student
 *     tags: [Students]
 *     description: Only teachers, principals, and admins can create students.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentInput'
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     description: Retrieve all students with pagination and filtering.
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
 *         description: Number of students per page
 *
 *       - in: query
 *         name: access_code
 *         schema:
 *           type: string
 *           example: STU-123456
 *         description: Filter by access code
 *
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *           example: SS3
 *         description: Filter by class
 *
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *           example: Science
 *         description: Filter by department
 *
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalStudents:
 *                   type: integer
 *                   example: 50
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650c8f7d2f3a4b5c6d7e890
 *         description: Student MongoDB ID
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/students/access/{access_code}:
 *   get:
 *     summary: Get student by access code
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: access_code
 *         required: true
 *         schema:
 *           type: string
 *         example: STU-123456
 *         description: Student access code
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Student not found or access code missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/students/{identifier}:
 *   put:
 *     summary: Update student
 *     tags: [Students]
 *     description: Update a student using MongoDB ID or access code.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         example: STU-123456
 *         description: MongoDB ID or student access code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentInput'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student updated successfully
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete student
 *     tags: [Students]
 *     description: Delete a student using MongoDB ID or access code.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         example: STU-123456
 *         description: MongoDB ID or student access code
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */



// Create Student
router.post( '/students', protect, staffProtect, createStudent );

// Get All Students
router.get( '/students', protect, staffProtect, getAllStudents );

// Get Student By ID
router.get( '/students/:id', protect, staffProtect, getStudentById );

// Get Student By Access Code
router.get( '/students/access/:access_code', protect, staffProtect, getStudentByAccess );

// Update Student
router.put( '/students/:identifier', protect, staffProtect, updateStudent );

// Delete Student
router.delete( '/students/:identifier', protect, staffProtect, deleteStudent );

//Get Student Profile
// Get Student By Access Code
router.get( '/students/profile/me', studentAuth, getMyProfile );

module.exports = router;