
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

async function test() {
    console.log('Testing DB connection...');
    try {
        await connectDB();
        console.log('DB connected!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

test();
