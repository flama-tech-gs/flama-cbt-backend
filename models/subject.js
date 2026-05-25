//models/subject.js

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(

	{
		name: {
			type: String,
			required: true,
			trim: true
		},

		code: {
			type: String,
			required: true,
			unique: true,
			uppercase: true
		},

		description: {
			type: String
		},

		class: {
			type: String,
			required: true
		},

		teacher: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},

		students: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Student'
			}
		],

		isActive: {
			type: Boolean,
			default: true
		}

	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model( 'Subject', subjectSchema );