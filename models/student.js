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
studentSchema.pre('save', async function (next) {

	if (!this.isModified('password')) {
		return next();
	}
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(
			this.password,
			salt
		);
		next();
	} catch (err) {
		next(err);
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