// Mongo Atlas connection
const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const db = client.db('carInfo');

let collection;

const { faker } = require('@faker-js/faker');


const createUser = () => {
    return {
        type: "user",
        userId: faker.string.uuid(),
        name: faker.person.fullName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        location: faker.location.streetAddress({ useFullAddress: true }),
        password: faker.internet.password(),
        vehiclesOwned: []
    };
}

const userArray = (length) => {
    const users = []

    let i = 0;
    while (i < length) {
        let newUser = createUser();
        users.push(newUser);
        i++;
    }

    return users;
}

// inserting data from populateUser file
const addUsers = async () => {
    const data = userArray(10);
    collection = db.collection('users');
    await collection.deleteMany();
    await collection.insertMany(data);
    console.log("Operation Successful", data);
}

addUsers();