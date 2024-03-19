// Mongo Atlas connection
const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const db = client.db('carInfo');

let collection;

const { faker } = require('@faker-js/faker');

const createSoldVehicle = () => {
    return {
        vehicleId: faker.string.uuid(),
        vehicleInfo: {}
    };
}

const soldVehicleArray = (length) => {
    const soldVehicles = []

    let i = 0;
    while (i < length) {
        let newSoldVehicle = createSoldVehicle();
        soldVehicles.push(newSoldVehicle);
        i++;
    }

    return soldVehicles;
}


// inserting data into mongoDB
const addSoldVehicles = async () => {
    const data = soldVehicleArray(8);

    collection = db.collection('soldVehicles');
    await collection.deleteMany();
    await collection.insertMany(data);
    console.log("Operation Successful", data);
}

addSoldVehicles();