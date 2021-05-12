const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate')
const session = require('express-session');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
// const passport = require('passport');
// const LocalStrategy = require('passport-local');



const Route = require("./models/route")
const Employee = require("./models/employee");

mongoose.connect("mongodb://localhost:27017/transportationSystem", 
{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () =>
{
    console.log("Database connected");
})

const app = express();

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()))

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser())


app.engine('ejs', ejsMate)
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true}));
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

app.post("/", catchAsync(async (req, res) =>
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
}))

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
    
    res.render("home", { userFound });
})

app.get("/routes", requireLogin, catchAsync(async (req, res) =>
{
    const userFound = req.session.user;

    const routeA = await Route.find({ departureTime: "8:30AM"});
    const routeB = await Route.find({ departureTime: "9:00AM"});
    const routeC = await Route.find({ departureTime: "11:30AM"});
    const routeD = await Route.find({ departureTime: "12:00PM"});
    const routeE = await Route.find({ departureTime: "4:30PM"});
    const routeF = await Route.find({ departureTime: "5:00PM"});
    
    res.render("routes", { routeA, routeB, routeC, routeD, routeE, routeF, userFound} );
}))

app.get("/schedule", requireLogin, (req, res) =>
{
    const userFound = req.session.user;

    const routesA = [];
    const routesB = [];
    res.render("schedule", { routesA, routesB, userFound });
})

app.post("/schedule", catchAsync(async (req, res) =>
{
    const userFound = req.session.user;
    
    const { from, to } = req.body;
    const routesFound = await Route.findAndCreate(from, to);
    const routesA = routesFound[0];
    const routesB = routesFound[1];

    res.render("schedule", { routesA, routesB, userFound });
    
}))

app.post("/scheduleRoute", catchAsync(async (req, res) =>
{
    const userFound = req.session.user;
    const { routeA, routeB } = req.body;

    let _id = routeA;
    let route = await Route.findById({ _id })
    let numPassengers = route.numPassengers + 1;

    await Route.findByIdAndUpdate(_id, { numPassengers })
    await route.passengers.push(userFound);
    await route.save()

    if (routeB)
    {
        _id = routeB;
        route = await Route.findById({ _id })
        numPassengers = route.numPassengers + 1;

        await Route.findByIdAndUpdate(_id, { numPassengers })
        await route.passengers.push(userFound);
        await route.save()
    }
    
    res.redirect("/schedule")
}))

app.all('*', (req, res, next) =>
{
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) =>
{
    const {statusCode = 500} = err;
    if (!err.message) err.message = "Oh no, something went wrong";
    res.status(statusCode).render('error', { err });
})




app.listen (3000, () =>
{
    console.log("serving on port 3000");
})

