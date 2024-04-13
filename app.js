const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");

const Review = require("./models/review.js")
// const listingRouter = require("./routes/listing.js")
// const reviewRouter = require("./routes/review.js")
// const userRouter = require("./routes/user.js")

const session = require("express-session")
const flash = require("connect-flash")

const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")

//to use ejs and css
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}

app.get("/", (req,res)=>{
    res.send("this is the root path");
})

app.use(session(sessionOptions));
app.use(flash());

//autenticcation of user (session should be there)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    next();
})

//connection to database
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/SecondBite');
}

main()
.then(()=>{
    console.log("connected to db")
})
.catch((err)=>{
    console.log(`error - ${err}`)
})

app.listen(5050, ()=>{
    console.log("server listening on port 5050")
})



// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "salad",
//         description: "very good salad",
//         price: 1200,
//         location: "baroda",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("success");

// })

//index route
app.get("/listings", async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings})
})

//new route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs")
})

//show route
app.get("/listings/:id", async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews")
    res.render("listings/show.ejs", {listing});
})

//create route
app.post("/listings", async (req, res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Food Item Added!")
    res.redirect("/listings");
})

//edit route
app.get("/listings/:id/edit", async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
})

//UPDATE ROUTE
app.put("/listings/:id", async (req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Food Item Updated!")
    res.redirect(`/listings/${id}`);
})

//delete route
app.delete("/listings/:id", async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success", "Food Item Deleted!")
   res.redirect("/listings"); 

})

//Reviews
//post route
app.post("/listings/:id/reviews", async(req, res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Added!")
    res.redirect(`/listings/${listing._id}`);
})

//delete review route
app.delete("/listings/:id/reviews/:reviewId", async(req, res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!")
    res.redirect(`/listings/${id}`)
})

//USER
app.get("/signup", (req, res)=>{
    res.render("users/signup.ejs");
})

app.post("/signup", async(req, res)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.flash("success", "Welcome to SecondBite");
        res.redirect("/listings");
    } catch(e){
        req.flash("success", e.message);
        res.redirect("/signup");
    }
})

app.get("/login", (req, res)=>{
    res.render("users/login.ejs");
});

app.post("/login", passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}), (req, res)=>{
    req.flash("success", "Welcome back to SecondBite!");
    res.redirect("/listings");
})