const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RouteSchema = new Schema(
{
    
    from: String,
    to: String,
    departureTime: String,
    arrivalTime: String,
    duration: Number,
    numPassengers: Number
})

module.exports = mongoose.model("Route", RouteSchema);