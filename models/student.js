//models/student.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(

	{
		surname: {
			type: String,
			required: true,
			trim: true
		},
		firstname: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			unique: true,
			sparse: true
		},
		access_code: {
			type: String,
			required: true,
			unique: true
		},

		password: {
			type: String,
			required: true
		},

		class: {
			type: String,
			required: true
		},
		role: {
		    type: String,
		    enum: ['student'],
		    default: 'student'
		},
		department: {
			type: String
		},

		age: {
			type: Number
		},

		admissionYear: {
			type: Number
		},

		parentPhoneNumber: {
			type: String,
			trim: true
		},

		currentTerm: {
			type: String,
			enum: ['First Term', 'Second Term', 'Third Term']
		},

		address: {
			type: String,
			trim: true
		},

		isActive: {
			type: Boolean,
			default: true
		}

	},
	{
		timestamps: true
	}
);

// Hash Password
studentSchema.pre('save', async function () {

	if (!this.isModified('password')) {
		return;
	}
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(
			this.password,
			salt
		);
		
	} catch (err) {
		throw err;
	}
});

// Compare Password
studentSchema.methods.comparePassword =
	async function (password) {
	return await bcrypt.compare(
		password,
		this.password
	);
};

module.exports = mongoose.model( 'Student', studentSchema );