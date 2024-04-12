const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");

// const listingRouter = require("./routes/listing.js")
// const reviewRouter = require("./routes/review.js")
// const userRouter = require("./routes/user.js")

// const session = require("express-session")
// const flash = require("connect-flash")

// const passport = require("passport")
// const LocalStrategy = require("passport-local")

//to use ejs and css
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))

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

app.get("/", (req,res)=>{
    res.send("this is the root path");
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
    const listing = await Listing.findById(id)
    res.render("listings/show.ejs", {listing});
})

//create route
app.post("/listings", async (req, res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
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
    res.redirect(`/listings/${id}`);
})

//delete route
app.delete("/listings/:id", async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   res.redirect("/listings"); 

})