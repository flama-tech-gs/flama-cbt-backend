// models/examAttempt.js

const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema(

	{
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Student',
			required: true
		},

		exam: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Exam',
			required: true
		},

		answers: [
			{
				question: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Question',
					required: true
				},

				selectedAnswer: {
					type: String,
					required: true
				},

				isCorrect: {
					type: Boolean,
					default: false
				},

				marksAwarded: {
					type: Number,
					default: 0
				}
			}
		],

		 remainingTime: {
	        type: Number,
	        default: 0
	    },
    
		startedAt: {
			type: Date,
			default: Date.now
		},

		submittedAt: {
			type: Date
		},

		score: {
			type: Number,
			default: 0
		},

		isSubmitted: {
			type: Boolean,
			default: false
		}

	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model(
	'ExamAttempt',
	examAttemptSchema
);