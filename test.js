/*const { connectToMongo } = require("./private/connection");

const {
    getUserByEmail,
    changePassword
} = require("./private/controllers/users");

async function runTest() {

    try {

        await connectToMongo();

        console.log("Connected to MongoDB.");

        const user = await getUserByEmail("alex@example.com");

        console.log(user);

    } catch (err) {

        console.error(err);

    }

    process.exit();

}

runTest();*/

const mongoose = require("mongoose");

async function test() {
    try {
        await mongoose.connect(
            "mongodb+srv://kyeeonacaesar_db_user:TestPassword123@cluster0.3p3eox9.mongodb.net/cebu_atlantic_db?retryWrites=true&w=majority&appName=Cluster0"
        );

        console.log("Connected!");
    } catch (err) {
        console.error(err);
    }

    process.exit();
}

test();