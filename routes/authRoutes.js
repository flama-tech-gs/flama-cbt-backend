//routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { register, acceptTeacher, login } = require('../controllers/authController');
const { protect, principal } = require ('../middleware/authMiddleware');


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization APIs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 664fa8d8f1a2d3c4b5e6f789
 *         surname:
 *           type: string
 *           example: Doe
 *         firstname:
 *           type: string
 *           example: John
 *         email:
 *           type: string
 *           example: johndoe@gmail.com
 *         role:
 *           type: string
 *           enum: [admin, principal, teacher, student]
 *           example: teacher
 *         isVerified:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     RegisterTeacherInput:
 *       type: object
 *       required:
 *         - surname
 *         - firstname
 *         - email
 *         - password
 *       properties:
 *         surname:
 *           type: string
 *           example: Doe
 *         firstname:
 *           type: string
 *           example: John
 *         email:
 *           type: string
 *           example: johndoe@gmail.com
 *         password:
 *           type: string
 *           example: password123
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - identifier
 *         - password
 *       properties:
 *         identifier:
 *           type: string
 *           example: johndoe@gmail.com
 *         password:
 *           type: string
 *           example: password123
 *
 *     VerifyTeacherInput:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: [teacher]
 *           example: teacher
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         surname:
 *           type: string
 *         firstname:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Internal Server Error
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a teacher account
 *     tags: [Auth]
 *     description: Creates a new teacher account awaiting verification by admin or principal.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterTeacherInput'
 *     responses:
 *       201:
 *         description: Teacher registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/accept:
 *   put:
 *     summary: Verify and accept a teacher
 *     tags: [Auth]
 *     description: Only admin or principal can verify a teacher account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         example: johndoe@gmail.com
 *         description: Teacher email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyTeacherInput'
 *     responses:
 *       200:
 *         description: Teacher verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teacher has been accepted
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user or student
 *     tags: [Auth]
 *     description: Login using email for staff/admin/principal or access code for students.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials or missing fields
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */


router.post('/register', register);
router.put('/accept', protect, principal, acceptTeacher);
router.post('/login', login);

module.exports = router;