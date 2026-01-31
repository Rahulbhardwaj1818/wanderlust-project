const User=require('../models/user.js');




module.exports.renderSignupForm= async(req,res)=>{
    res.render("./users/signup.ejs");
};



module.exports.Signup= async(req,res,next)=>{
    try{
    let {username,email,password}=req.body.user;
    let newUser=new User({email,username});
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.login (registeredUser,(err)=>{
        if(err) return next(err);
        req.flash('success','Welcome to the Wanderlust!');
res.redirect('/listings');
    });

} catch(e){
    req.flash('error',e.message);
    res.redirect('/signup');        
}
};


module.exports.renderloginForm=(req,res)=>{
    res.render('./users/login.ejs');
};




module.exports.Login= async(req,res)=>{

    req.flash('success','logged in successfully');
     let redirectUrl=res.locals.redirectUrl || '/listings';
    res.redirect(redirectUrl);
};


module.exports.Logout= (req,res,next)=>{
    req.logout((err)=>{
        if(err){  
            return next(err);
        } 
        req.flash('success','logged out successfully');
        res.redirect('/listings');
    });
};
