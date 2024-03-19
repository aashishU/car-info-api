# car-info-api
### This REST API is designed to serve both Customers and Car Dealerships.
### It can query the Cloud Database and provide with required data.

#### Tech Used: Node and Express
#### Database: MongoDB Atlas
#### Authorization : Json Web Token

## Directions to use:
- Login or Signup : This returns a cookie that contains a Json Web Token
- To auth each request, JWT is needed.

- Open Terminal, cd to car-info-api folder
- To Download Dependencies run : npm install

- To star mongodb server: brew services start mongodb-community@7.0
- To start the API: node index.js

---------------------------------------------------------------------

## Auth Routes
##### Data received by these routes should include type variable where {type : users/dealerships}
- POST "/api/login" : Login
- GET "/api/logout" : Logout
- POST "/api/signup" : Signup

## Common Routes

- GET "/api/car" : View all cars
- GET "/api/dealership/:dealerId/car : View all cars in a certain dealership
- POST "/api/user : Add new owned vehicle by a user
- POST "/api/dealership/:dealerId/sold-vehicle" : Add sold_vehicle to a dealership
- GET "/api/dealership/:dealerId/deal" : View all Deals from a certain dealership

## For Customers Only

- GET "/api/car/:carId/dealership" : Dealerships where a specific car is available
- GET "/api/user/my-car" : All vehicles owned by currentUser along with Dealer Info
- GET "/api/car/:carId/deal" : View all deals on a certain car

## For Dealerships Only

- POST "/api/dealership/:dealerId/new-car" : Add cars to a certain dealership
- POST "/api/dealership/:dealerId/new-deal" : Add deals to dealership
- GET "/api/dealership/:dealerId/sold-vehicle" : View all vehicles sold by dealership with owner info

---------------------------------------------------------------------


## Populate Data in MongoDB Atlas
- Run 'node seedData/car.js' once and then exit.
- Run 'node seedData/deal.js' once and then exit.
- Run 'node seedData/dealership.js' once and then exit.
- Run 'node seedData/soldVehicle.js' once and then exit.
- Run 'node seedData/user.js' once and then exit.
