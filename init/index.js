const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initdata = require("./data.js");

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

const initDB = async () => {
    await Listing.deleteMany({});
    //making an owner for each listing
    // initdata.data = initdata.data.map((obj)=>({...obj, owner: "658eee8db9ea95d163fda5a8"}))
    await Listing.insertMany(initdata.data);

    console.log("successfull db insertion");
}

initDB();
