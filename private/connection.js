require('dotenv').config();

const mongoose = require('mongoose');

async function connectToMongo(callback) {
    try {
        await mongoose.connect(
    "mongodb+srv://kyeeonacaesar_db_user:TestPassword123@cluster0.3p3eox9.mongodb.net/cebu_atlantic_db?retryWrites=true&w=majority&appName=Cluster0"
);

        console.log("MongoDB Connected via Mongoose!");

        if (callback) callback();
    } catch (err) {
        console.error("MongoDB Connection Error:");
        console.error(err);

        if (callback) callback(err);
    }
}

module.exports = { connectToMongo };