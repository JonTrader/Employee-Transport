const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require('express-session');
// const passport = require('passport');
// const LocalStrategy = require('passport-local');

const app = express();


const User = require('./models/user')
const Route = require("./models/route")
const Employee = require("./models/employee");
const { json } = require("express");

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

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()))

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser())

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true}));
app.use(express.json())
app.use(session({secret: 'loginSecret'}))

const requireLogin = (req, res, next) =>
{
    if (!req.session.user_id)   return res.redirect('/');

    next();
}

const loggedIn = (req, res, next) =>
{
    if (req.session.user_id)    return res.redirect("/home");

    next();
}

app.get("/", loggedIn, (req, res) =>
{
    res.render("login");
})

app.post("/", async (req, res) =>
{
    const { username, password } = req.body;
    const foundUser = await Employee.findAndValidate(username, password);
    
    if (foundUser)
    {
        req.session.user = foundUser;
        req.session.user_id = foundUser._id;
        res.redirect('/home');
    }
    else
    {
        res.redirect('/');
    }
})

app.post('/logout', (req, res) =>
{
    req.session.user_id = null;
    req.session.user = null;
    req.session.destroy();
    res.redirect('/')
})

app.get("/home", requireLogin, (req, res) =>
{
    const userFound = req.session.user;
    const title = userFound.title;
    const lastName = userFound.surname;
    
    res.render("home", { title, lastName });
})

app.get("/routes", requireLogin, async (req, res) =>
{
    const userFound = req.session.user;
    const title = userFound.title;
    const lastName = userFound.surname;

    const routeA = await Route.find({ departureTime: "8:30AM"});
    const routeB = await Route.find({ departureTime: "9:00AM"});
    const routeC = await Route.find({ departureTime: "11:30AM"});
    const routeD = await Route.find({ departureTime: "12:00PM"});
    const routeE = await Route.find({ departureTime: "4:30PM"});
    const routeF = await Route.find({ departureTime: "5:00PM"});
    
    res.render("routes", { routeA, routeB, routeC, routeD, routeE, routeF, title, lastName} );
})

app.get("/schedule", requireLogin, (req, res) =>
{
    const userFound = req.session.user;
    const title = userFound.title;
    const lastName = userFound.surname;

    const routesFound = [];
    res.render("schedule", { routesFound, title, lastName });
})

app.post("/schedule", async (req, res) =>
{
    const userFound = req.session.user;
    const title = userFound.title;
    const lastName = userFound.surname;
    
    const { from, to } = req.body;
    const routesFound = await Route.findAndCreate(from, to);
    res.render("schedule", { routesFound, title, lastName });
    
})





app.listen (3000, () =>
{
    console.log("serving on port 3000");
})