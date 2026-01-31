const mongoose= require('mongoose');
const initData=require("./data.js");
const Listing= require("../models/listing.js");
const User = require("../models/user.js");


main().then(()=>{
    console.log('Connected to MongoDB');
})
.catch(err=>{
    console.log('Error connecting to MongoDB:',err);
});

async function main(){
await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


const initDB=async()=>{
    await Listing.deleteMany({});

    let user = await User.findOne({username: "rahul"});
    if (!user) {
        user = await User.register(new User({email: "rahul@gmail.com", username: "rahul"}), "rahul");
    }
    console.log("Assigning listings to user:", user.username);

   initData.data= initData.data.map((obj)=>({...obj,owner: user._id, geometry: { type: "Point", coordinates: [77.209, 28.6139] }}));
await Listing.insertMany(initData.data);
console.log('Database initialized with sample data');
};
initDB().then(() => mongoose.connection.close());