// Mongo Atlas connection
const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const db = client.db('carInfo');

let collection;

const { faker } = require('@faker-js/faker');



const createCar = () => {
    return {
        carId: faker.string.uuid(),
        name: faker.vehicle.vehicle(),
        type: faker.vehicle.type(),
        model: faker.vehicle.model(),
        dealId: faker.string.uuid(),
        availableAtDealers: [],
    };
}


const carArray = (length) => {
    const cars = [];

    let i = 0;
    while (i < length) {
        let newCar = createCar();
        cars.push(newCar);
        i++;
    }

    return cars;
}


// inserting cars into the mongoDB
const addCars = async () => {
    const data = carArray(10);

    collection = db.collection('cars');
    await collection.deleteMany();
    await collection.insertMany(data);
    console.log("Operation Successful", data);
}

addCars();