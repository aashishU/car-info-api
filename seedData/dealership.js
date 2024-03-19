// Mongo Atlas connection
const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const db = client.db('carInfo');

let collection;

const { faker } = require('@faker-js/faker');

const createDealership = () => {
    return {
        type: "dealership",
        dealerId: faker.string.uuid(),
        name: faker.company.name(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        location: faker.location.streetAddress({ useFullAddress: true }),
        password: faker.internet.password(),
        cars: [],
        deals: [],
        sold_vehicles: []
    };
}

const dealershipArray = (length) => {
    const dealerships = []

    let i = 0;
    while (i < length) {
        let newDealership = createDealership();
        dealerships.push(newDealership);
        i++;
    }

    return dealerships;
}


// inserting data from populateUser file
const addDealerships = async () => {
    const data = dealershipArray(3);

    collection = db.collection('dealerships');
    await collection.deleteMany();
    await collection.insertMany(data);
    console.log("Operation Successful", data);
}

addDealerships();