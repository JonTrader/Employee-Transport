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

RouteSchema.statics.findAndCreate = async function(from, to)
{
    let routesFound = await this.find({ from, to });
    let routesA, routesB;
    let altRoutes = [];
    if (routesFound.length === 0)
    {
        routesA = await this.find({from, to: "Midtown East"});
        routesB = await this.find({from: "Midtown East", to});

        for (let route of routesA)
        {
            altRoutes.push(route);
        }

        for (let route of routesB)
        {
            altRoutes.push(route);
        }

        return altRoutes
    }
    return routesFound;
}

module.exports = mongoose.model("Route", RouteSchema);