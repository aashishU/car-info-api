const { MongoClient } = require('mongodb');
require('dotenv').config();

// Replace the connection string with your own from MongoDB Atlas


async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;

    const client = new MongoClient(uri);
    const db = client.db('carInfo');

    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas', error);
    }
}

// Call the connectToDatabase function to establish the connection
module.exports = connectToDatabase;