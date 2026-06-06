//utils/generateAccessCode.js

const generateAccessCode = () => {

	const random =
		Math.floor(1000 + Math.random() * 9000);

	return `FLM-2026-${random}`;
};

module.exports = generateAccessCode;