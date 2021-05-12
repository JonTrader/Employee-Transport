const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate')
const session = require('express-session');
const flash = require('connect-flash');
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
app.use(session({secret: 'loginSecret', resave: false, saveUninitialized: false}))

app.use(flash());


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

app.use((req, res, next) =>
{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

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
        req.flash("success", "Successfully Logged in")
        res.redirect('/home');
    }
    else
    {
        req.flash("error", "Unsuccessful login")
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

    const routeA = await Route.find({ departureTime: "08:30:00"});
    const routeB = await Route.find({ departureTime: "09:00:00"});
    const routeC = await Route.find({ departureTime: "11:30:00"});
    const routeD = await Route.find({ departureTime: "12:00:00"});
    const routeE = await Route.find({ departureTime: "16:30:00"});
    const routeF = await Route.find({ departureTime: "17:00:00"});
    
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

    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    

    if (routeA && !routeB)
    {
        console.log("1 route")
        let _id = routeA;
        let routeOne = await Route.findById({ _id })

        if (time < routeOne.departureTime)
        {
            let numPassengers = routeOne.numPassengers + 1;

            await Route.findByIdAndUpdate(_id, { numPassengers })
            await routeOne.passengers.push(userFound);
            await routeOne.save()
            req.flash("success", "Successfully Scheduled Transportation")
            return res.redirect("/schedule")
        }
        else
        {
            req.flash("error", "Unsuccessfully Scheduled")
            return res.redirect("/home");
        } 
        
    }

    if (routeA && routeB)
    {

        console.log("2 routes")

        let _id = routeA;
        let routeOne = await Route.findById({ _id })

        _id = routeB;
        let routeTwo = await Route.findById({ _id })

        

        if (time < routeOne.departureTime && routeOne.arrivalTime < routeTwo.departureTime)
        {

            _id = routeA;
            let numPassengers = routeOne.numPassengers + 1;

            await Route.findByIdAndUpdate(_id, { numPassengers })
            await routeOne.passengers.push(userFound);
            await routeOne.save()

            _id = routeB
            numPassengers = routeTwo.numPassengers + 1;

            await Route.findByIdAndUpdate(_id, { numPassengers })
            await routeTwo.passengers.push(userFound);
            await routeTwo.save()
            req.flash("success", "Successfully Scheduled Transportation")
            return res.redirect("/schedule")
        }
        else
        {
            req.flash("error", "Unsuccessfully Scheduled")
            return res.redirect("/home");
        }

        

    }

    res.redirect("/home");
    
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

