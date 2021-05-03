const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const Route = require("./models/route")
const Employee = require("./models/employee")

mongoose.connect("mongodb://localhost:27017/transportationSystem", 
{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () =>
{
    console.log("Database connected");
})

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) =>
{
    res.render("login");
})

app.get("/home", (req, res) =>
{
    res.render("home");
})

app.get("/routes", async (req, res) =>
{
    const routeA = await Route.find({ departureTime: "8:30AM"});
    const routeB = await Route.find({ departureTime: "9:00AM"});
    const routeC = await Route.find({ departureTime: "11:30AM"});
    const routeD = await Route.find({ departureTime: "12:00PM"});
    const routeE = await Route.find({ departureTime: "4:30PM"});
    const routeF = await Route.find({ departureTime: "5:00PM"});
    res.render("routes", { routeA, routeB, routeC, routeD, routeE, routeF} );
})

app.get("/schedule", (req, res) =>
{
    res.render("schedule");
})


app.listen (3000, () =>
{
    console.log("serving on port 3000");
})