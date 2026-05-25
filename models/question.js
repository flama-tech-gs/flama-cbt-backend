//models/question.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({

	exam: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Exam',
		required: true
	},

	question: {
		type: String,
		required: true
	},

	options: [{
		type: String,
		required: true
	}],

	correctAnswer: {
		type: String,
		required: true
	},

	marks: {
		type: Number,
		default: 1
	}

},{
	timestamps: true
});

module.exports = mongoose.model('Question', questionSchema );