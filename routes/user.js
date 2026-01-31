const express=require('express');
const router=express.Router();
const User=require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const usercontroller = require('../controller/users.js');

router.get('/signup',usercontroller.renderSignupForm);

router.post('/signup', wrapAsync(usercontroller.Signup));    

router.get("/login",usercontroller.renderloginForm);


router.post("/login",saveRedirectUrl,passport.authenticate("local",{ failureRedirect: '/login' , failureFlash:true, }),usercontroller.Login

);


router.get("/logout",usercontroller.Logout);



module.exports=router;