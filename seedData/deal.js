// Mongo Atlas connection
const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const db = client.db('carInfo');

let collection;

const { faker } = require('@faker-js/faker');

const createDeal = () => {
    return {
        dealId: faker.string.uuid(),
        dealInfo: []
    };
}

const dealArray = (length) => {
    const deals = []

    let i = 0;
    while (i < length) {
        let newDeal = createDeal();
        deals.push(newDeal);
        i++;
    }

    return deals;
}


// inserting data into mongoDB
const addDeals = async () => {
    const data = dealArray(5);

    collection = db.collection('deals');
    await collection.deleteMany();
    await collection.insertMany(data);
    console.log("Operation Successful", data);
}

addDeals();