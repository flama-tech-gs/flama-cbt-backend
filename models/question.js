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

	options: {
	    a: { type: String, required: true },
	    b: { type: String, required: true },
	    c: { type: String, required: true },
	    d: { type: String, required: true },
	    e: { type: String, required: true },
	},

	correctAnswer: {
		type: String,
		enum: ['a', 'b', 'c', 'd', 'e'],
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