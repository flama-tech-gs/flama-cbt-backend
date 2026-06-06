//models/exam.js

const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({

	title: {
		type: String,
		required: true,
		trim: true
	},

	subject: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Subject',
		required: true
	},

	instructions: {
		type: String
	},

	duration: {
		type: Number,
		default: 60
	},

	maxQuestions: {
		type: Number,
		default: 100,
		max: 100
	},

	totalMarks: {
		type: Number,
		default: 100
	},

	term: {
		type: String,
		enum: ['First Term', 'Second Term', 'Third Term']
	},

	session: {
		type: String
	},

	isActive: {
		type: Boolean,
		default: false
	},

	startDate: {
		type: Date
	},

	endDate: {
		type: Date
	},

	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}

},{
	timestamps: true
});

module.exports = mongoose.model('Exam', examSchema );