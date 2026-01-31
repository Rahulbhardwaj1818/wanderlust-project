const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN || "pk.eyJ1IjoidGVqYXMxODE4IiwiYSI6ImNta3Y0ZjUwZDAxeXQzY3BjNWE1NDgwZnMifQ.YDjNRf-6kSA29f_6PmGHlw";
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async(req,res)=>{
    const { category, search } = req.query;
    let filter = {};
    if (category) {
        filter.category = category;
    }
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } }
        ];
    }
    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs",{allListings, category, search, mapToken});
};


module.exports.renderNewForm=(req,res)=>{
  res.render("listings/new.ejs", { mapToken });
};


module.exports.showListing=async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id).populate({path:'reviews',populate:{path:"author",},}).populate('owner');
    if(!listing){
        req.flash("error","Listing not found !");
       return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing, mapToken});
};



module.exports.createListing=async(req,res,next)=>{
let response=await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();


    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    if (req.file) {
        newListing.image.filename = req.file.filename;
        newListing.image.url = '/uploads/' + req.file.filename;
    }
    newListing.owner = req.user._id;
    newListing.image={url,filename};

newListing.geometry=response.body.features[0].geometry;

    let savedlisting=await newListing.save();
     console.log(savedlisting);
    req.flash("success","successfully created a new listing");
    res.redirect(`/listings`);
};



module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found !");
       return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace('/uploads','/uploads/h_300,w_250');
    res.render("listings/edit.ejs",{listing,originalImageUrl, mapToken})};




module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    if (!req.body.listing) {
        req.flash("error","Invalid data provided");
        return res.redirect(`/listings/${id}/edit`);
    }
      
let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
       if (typeof req.file  !=='undefined') {
let url=req.file.path;
    let filename=req.file.filename;
listing.image={url,filename};
    await listing.save();
       }
       req.flash("success","Listing Updated !");
   res.redirect(`/listings/${id}`)};




module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
     req.flash("success"," listing Deleted !");
    res.redirect('/listings')};
