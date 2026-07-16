require('dotenv').config();

const mongoose = require('mongoose');
const mongoURI = `${process.env.MONGO_URI}/${process.env.DATABASE_NAME}`;

function connectToMongo(callback) {
    mongoose.connect(mongoURI)
        .then(() => {
            console.log("MongoDB Connected via Mongoose!");
            if (callback) callback();
        })
        .catch((err) => {
            console.error(`MongoDB Connection Error: ${err}!`);
            if (callback) callback(err);
        });
}

module.exports = { connectToMongo };