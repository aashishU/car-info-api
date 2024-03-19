const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const { verifyCookieToken } = require('./middleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT;
const { v4: uuid } = require('uuid');
const cors = require('cors');


// Mongo Atlas connection
const { MongoClient } = require('mongodb');
const connectToDatabase = require('./mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const db = client.db('carInfo');
let collection;
connectToDatabase();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());


// LOGIN Routes
app.post('/api/login', async (req, res) => {
    const type = req.body.type;
    console.log(req.body);
    // check if username and password match
    collection = db.collection(type);
    const account = await collection.findOne({ username: req.body.username, password: req.body.password });
    console.log(account);
    if (!account) {
        return res.status(400).send("Incorrect username or password!!")
    }

    // CREATE JWT
    const token = jwt.sign(account, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });

    // put jwt inside a cookie and send the cookie to browser
    res.cookie("token", token, {
        httpOnly: true,
        //secure: true,
        //maxAge: 1000000,
        //signed: true,
    });
    return res.status(200).json({ message: "Login Successful" });
});

// LOGOUT Routes
app.get('/api/logout', verifyCookieToken, (req, res) => {
    // delete cookie
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout Successful" });
})

// SIGNUP Routes
app.post('/api/signup', async (req, res) => {
    const type = req.body.type;

    const newUser = {
        type: "user",
        userId: uuid(),
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        location: req.body.address,
        password: req.body.password,
        vehiclesOwned: []
    };

    const newDealer = {
        type: "dealership",
        dealerId: uuid(),
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        location: req.body.address,
        password: req.body.password,
        cars: [],
        deals: [],
        sold_vehicles: []
    };

    const newAccount = (type === "users" ? newUser : newDealer);

    collection = db.collection(type);
    const usernameExist = await collection.findOne({ username: newAccount.username });
    const message = { message: "Username already in use. Try another Username" };

    // check if username already in use
    if (usernameExist) {
        return res.status(406).json(message);
    } else {
        // CREATE USER/DEALER
        await collection.insertOne(newAccount);
        // CREATE Jwt
        const token = jwt.sign(newAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });

        // put jwt inside a cookie and send the cookie to browser
        res.cookie("token", token, {
            httpOnly: true,
            //secure: true,
            //maxAge: 1000000,
            //signed: true,
        });
        return res.status(200).json({ message: "Signup Successful" });

    }
})


// app.post('/api/dealer/signup', async (req, res) => {
//     try {
//         const newDealer = {
//             type: "dealership",
//             dealerId: uuid(),
//             name: req.body.name,
//             username: req.body.username,
//             email: req.body.email,
//             location: req.body.address,
//             password: req.body.password,
//             cars: [],
//             deals: [],
//             sold_vehicles: []
//         };

//         collection = db.collection("dealerships");
//         const dealerExist = await collection.findOne({ username: newDealer.username });
//         const message = { status: "ERROR", message: "Username already in use. Try another Username" };

//         if (dealerExist) {
//             return res.send(message);
//         } else {
//             // CREATE DEALERSHIP
//             await collection.insertOne(newDealer);
//             // CREATE Jwt
//             const accessToken = jwt.sign(newDealer, process.env.ACCESS_TOKEN_SECRET);
//             return res.json({ status: 200, message: "New Dealership Created..", accessToken: accessToken, dealership: newDealer });
//         }
//     } catch (err) {

//     }
// })


// __________________________## COMMON ROUTES ##____________________________

// View all cars
app.get('/api/car', verifyCookieToken, async (req, res) => {
    collection = db.collection("cars");
    let cars = await collection.find().toArray();
    return res.json(cars);
})


// View all cars in a certain dealership
app.get('/api/dealership/:dealerId/car', verifyCookieToken, async (req, res) => {
    const id = req.params.dealerId;
    collection = db.collection("dealerships");
    const result = await collection.findOne({ dealerId: id });
    return res.json(result.cars);
})


// Add new owned vehicle by a user
app.post('/api/user/', verifyCookieToken, async (req, res) => {
    const id = req.data.userId;
    const result = { vehicleId: req.body.vehicleId, name: req.body.name, type: req.body.type, model: req.body.model };

    collection = db.collection("users");
    await collection.updateOne({ userId: id }, { $push: { "vehiclesOwned": result } });
    return res.json({ status: "New Vehicle Owned", result });
})

// Add sold_vehicle to a dealership
app.post('/api/dealership/:dealerId/sold-vehicle', verifyCookieToken, async (req, res) => {
    const id = req.params.dealerId;
    const { vehicleId: vId } = req.body;
    const data = { vehicleId: vId, vehicleInfo: { name: req.body.name, type: req.body.type, model: req.body.model } }

    collection = db.collection("dealerships");
    await collection.updateOne({ dealerId: id }, { $push: { "sold_vehicles": data } });
    return res.json({ status: "Sold Vehicle Added", data });

})

// View all Deals from a certain dealership
app.get('/api/dealership/:dealerId/deal', verifyCookieToken, async (req, res) => {
    const id = req.params.dealerId;

    collection = db.collection("dealerships");
    const result = await collection.findOne({ dealerId: id });
    return res.json(result.deals);
})



// __________________________## For Users ONLY ##____________________________

// Dealerships where a specific car is available
app.get('/api/car/:carId/dealership', verifyCookieToken, async (req, res) => {
    // check if data.type === user and not a dealership
    if (req.data.type === "user") {
        const id = req.params.carId;

        collection = db.collection("cars");
        const car = await collection.findOne({ carId: id });
        const availableAt = car.availableAtDealers;
        return res.json(availableAt);
    } else {
        return res.send("RESTRICTED AREA!!");
    }


})

// All vehicles owned by currentUser along with Dealer Info
app.get('/api/user/my-car', verifyCookieToken, async (req, res) => {
    // check if data.type === user and not a dealership
    if (req.data.type === "user") {
        const id = req.data.userId;

        collection = db.collection("users");       // finding the user
        const vehicleList = (await collection.findOne({ userId: id })).vehiclesOwned;       // users vehicleList

        collection = db.collection("dealerships");
        const dealershipList = await collection.find().toArray();          // all dealerships

        const result = [];

        vehicleList.map((vehicle) => {                      // looping over vehicleList
            let vehicleId = vehicle.vehicleId;
            dealershipList.map((dealer) => {                // looping over dealerList.sold_vehicles
                let soldCars = dealer.sold_vehicles;

                soldCars.map((car) => {                    // looping over sold_vehicles
                    if (car.vehicleId === vehicleId) {     // if dealerList.sold_vehicleId === user.vehicleList.vehicleId
                        result.push({ car, dealer });      // puts vehicle and its dealer detail into result Array.
                    }
                })
            })
        })
        return res.json(result);
    } else {
        return res.send("RESTRICTED AREA!!");
    }
});


// View all deals on a certain car
app.get('/api/car/:carId/deal', verifyCookieToken, async (req, res) => {
    // check if data.type === user and not a dealership
    if (req.data.type === "user") {
        const id = req.params.carId;

        collection = db.collection("cars");
        const car = await collection.findOne({ carId: id });

        collection = db.collection('deals');
        const allDeals = await collection.find().toArray();

        const dealArray = [];

        allDeals.map((deal) => {
            if (car.dealId === deal.dealId) {
                dealArray.push(deal);
            }
        })
        return res.json(dealArray);
    } else {
        return res.send("RESTRICTED AREA!!");
    }
})


// __________________________## For Dealers ONLY ##____________________________

// Add cars to a certain dealership
app.post('/api/dealership/:dealerId/new-car', verifyCookieToken, async (req, res) => {
    // check if data.type === dealership and not a dealership
    if (req.data.type === "dealership") {
        const id = req.params.dealerId;
        const carData = { carId: uuid(), name: req.body.name, type: req.body.type, model: req.body.model, dealId: uuid() };

        // adding new car into dealer.cars
        collection = db.collection("dealerships");
        await collection.updateOne({ dealerId: id }, { $push: { cars: carData } });

        // adding car to cars collection if not already present
        collection = db.collection("cars");
        const isCarAlreadyInList = await collection.findOne({ name: carData.name });

        if (!isCarAlreadyInList) {
            await collection.insertOne(carData);
        }
        return res.json({ status: "New car added", carData });
    } else {
        return res.send("RESTRICTED AREA!!");
    }
})


// Add deals to dealership
app.post('/api/dealership/:dealerId/new-deal', verifyCookieToken, async (req, res) => {
    // check if data.type === dealership and not a dealership
    if (req.data.type === "dealership") {
        const dealInfo = [];
        const dealData = req.body.dealInfo;

        if (dealData) {
            dealInfo.push(dealData);
        }

        const id = req.params.dealerId;
        const newDeal = { dealId: req.body.dealId, dealInfo: dealInfo };

        // add deal to dealership
        collection = db.collection('dealerships');
        await collection.updateOne({ dealerId: id }, { $push: { deals: newDeal } });

        // add deal to deals collection if deal not already present
        collection = db.collection('deals');
        const isDealPresent = await collection.findOne({ dealId: newDeal.dealId });

        if (!isDealPresent) {
            await collection.insertOne(newDeal);
        }

        return res.json({ status: "New Deal Added", newDeal });
    } else {
        return res.send("RESTRICTED AREA!!");
    }
})


// View all vehicles sold by dealership with owner info
app.get('/api/dealership/:dealerId/sold-vehicle', verifyCookieToken, async (req, res) => {
    // check if data.type === dealership and not a dealership
    if (req.data.type === "dealership") {
        const id = req.params.dealerId;

        collection = db.collection('dealerships');
        const soldVehicles = (await collection.findOne({ dealerId: id })).sold_vehicles;    // list of sold_vehicles of current dealer

        collection = db.collection('users');
        const userList = await collection.find().toArray();     // list of all users
        const data = [];

        soldVehicles.map((vehicle) => {             // traversing sold_vehicle list
            userList.map((user) => {                // traversing user list
                let ownedVehicleList = user.vehiclesOwned
                ownedVehicleList.map((currOwnedVehicle) => {    // traversing owned vehicles by current user
                    if (vehicle.vehicleId === currOwnedVehicle.vehicleId) {
                        // if current soldVehicle.vehicleId === ownedVehicle.vehicleId of current user
                        data.push({ vehicle, user });
                    }
                })
            })
        })

        return res.json(data);
    } else {
        return res.send("RESTRICTED AREA!!");
    }
})

app.use((req, res) => {
    res.status(404).send("Page Not Found");
})

// Asynchronous error handling using promises
app.get('/api/error', (req, res) => {
    asyncFunction()
        .then(data => res.json({ data }))
        .catch(error => res.status(500).json({ error: error.message }));
});


app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});