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
        
        server.listen(process.env.SERVER_PORT, () => {
            console.log(`Server Running On http://localhost:${process.env.SERVER_PORT}`);
        });
    } catch (error) {
        console.error('Server Not Started!');
    }
}

module.exports = { connectToServer };