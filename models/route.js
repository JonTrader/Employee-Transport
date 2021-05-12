const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RouteSchema = new Schema(
{
    from: String,
    to: String,
    departureTime: String,
    arrivalTime: String,
    duration: Number,
    numPassengers: Number,
    passengers: [
    {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        unique: true
    }]
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

        altRoutes.push(routesA);
        altRoutes.push(routesB);

        return altRoutes
    }

    let mainRoutes = [];
    mainRoutes.push(routesFound);
    mainRoutes.push([]);

    return mainRoutes;
}




module.exports = mongoose.model("Route", RouteSchema);