require('dotenv').config();

const mongoose = require('mongoose');
const mongoURI = `${process.env.MONGO_URI}/${process.env.DATABASE_NAME}`;

async function connectToMongo(callback) {
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected via Mongoose!");
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error}!`);
        throw error;
    }
}

async function connectToServer(server) {
    try {
        await connectToMongo();
        
        server.listen(process.env.SERVER_PORT, '0.0.0.0', () => {
            console.log(`Server Running On http://127.0.0.1:${process.env.SERVER_PORT}`);
        });
    } catch (error) {
        console.error('Server Not Started!');
    }
}

module.exports = { connectToServer };