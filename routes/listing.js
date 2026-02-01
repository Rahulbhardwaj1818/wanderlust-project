const express=require('express');
const router=express.Router();
const wrapAsync=require('../utils/wrapAsync.js');
const Listing=require("../models/listing.js");
const { isLoggedIn ,isOwner,validateListing} = require('../middleware.js');

const listingController=require("../controller/listings.js");
const multer  = require('multer')
const { storage } = require('../cloudConfig.js');
const multerStorage = multer({ storage: storage });
const upload = multer({ storage});


router.route("/")
.get(wrapAsync(async (req, res, next) => {
    const { category, search } = req.query;
    if (category && category !== "All") {
        const allListings = await Listing.find({ category });
        res.render("listings/index.ejs", { allListings, category });
    } else if (search) {
        const allListings = await Listing.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        });
        res.render("listings/index.ejs", { allListings, search });
    } else {
        if (category === "All") {
            const allListings = await Listing.find({});
            res.render("listings/index.ejs", { allListings, category });
        } else {
            await listingController.index(req, res, next);
        }
    }
}))
.post(isLoggedIn, validateListing,upload.single('listing[image]'), wrapAsync(listingController.createListing));

//new route
router.get("/new",isLoggedIn, listingController.renderNewForm
);

router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put( isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));





//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm
));



module.exports=router;