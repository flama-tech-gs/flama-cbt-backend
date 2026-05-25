// config/redis.js

const redis = require('redis');

let redisClient;


const connectRedis = async () => {
	try {	
		if (process.env.REDIS_URL) {
			//For Production
			redisClient = redis.createClient({ url: process.env.REDIS_URL });

		} else {
			// Local Development
			redisClient = redis.createClient ({
				socket: {
					host: process.env.REDIS_HOST || "127.0.0.1",
			    	port: Number(process.env.REDIS_PORT) || 6379,
				},
			    password: process.env.REDIS_PASS || undefined,  
			});
		}

		redisClient.on('error', (err) => {
			console.log('Redis Error:', err);
		});

		await redisClient.connect();
		console.log('Redis Connected');
	} catch (err) {
		console.log('Redis Init Error:', err);
	}
};

connectRedis();

module.exports = redisClient;