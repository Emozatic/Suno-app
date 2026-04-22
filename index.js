const express= require("express");
const app= express();
const mongoose= require("mongoose");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const SongListing= require("./model/song");
const ExpressError= require("./ExpressError");
const {songSchema}= require("./schema");
const session= require("express-session");
const flash= require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./model/user");
const {isloggedIn}= require("./middleware");
const {saveRedirectUrl}= require("./middleware");
const {isOwner}=require("./middleware");
const songController= require("./controller/songs")

//db connect
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/suno2");
}
main()
.then(()=>{
    console.log("connected to mongodb");
}).catch((err)=>{console.log(err)});



//usefull middlewares
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions={
    secret:"superSecret",
    resave:false,
    saveUninitialized:true,
    cookies:{
        maxAge:7*25*60*60*1000,
        httpOnly:true,
        secure:true
    }
}

app.use(session(sessionOptions));

//passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//joi middleware
const validateSong= (req,res,next)=>{
    let{err}= songSchema.validate(req.body);
    if(err){
        let msg= err.details.map(el=>el.message).join(",");
        throw new ExpressError(400,msg);
    }
    next();
};


//wrapAsync for async errors
function wrapAsync (fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>next(err));
    }
}


//flash
app.use(flash());

app.use((req,res,next)=>{
    res.locals.successMsg= req.flash("success");
    res.locals.errorMsg= req.flash("error");
    res.locals.currUser= req.user;
    next();
})

//index.route
app.get("/home",wrapAsync(songController.home))

//render new form
app.get("/new",isloggedIn,wrapAsync(songController.renderNewForm));

//post new form
app.post("/home",isloggedIn,validateSong,wrapAsync(songController.postNewForm));

//show route
app.get("/show/:id",wrapAsync(songController.show));

//render edit form
app.get("/show/:id/edit",isloggedIn,isOwner,wrapAsync(songController.renderEditForm));

//post edit form
app.put("/show/:id",isloggedIn,validateSong,wrapAsync(songController.postEditFomr));

//delete route
app.delete("/show/:id",isloggedIn,isOwner,wrapAsync(songController.deleteSong));

//register route
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})

app.post("/signup",wrapAsync(async(req,res)=>{
    try{
        let{email,username,password}= req.body;
    const newUser= new User({email, username});
    const registeredUser= await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            req.flash("error", "Login failed after registration");
            return res.redirect("/signup");
        }
    req.flash("success","New Journey begins");
    res.redirect("/home");
    })}catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
}))

//login route
app.get("/login",saveRedirectUrl,(req,res)=>{
    res.render("login.ejs");
})

//post login route
app.post("/login",saveRedirectUrl,passport.authenticate("local",{
    failureFlash:true,
    failureRedirect:"/login",
}),wrapAsync(async(req,res)=>{
    req.flash("success","Welcome Back");
    let redirectUrl= res.locals.redirectUrl || "/home";
    res.redirect(redirectUrl);
}))
    
//logout route
app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You have been logged out");
        res.redirect("/login");
    });
});

//error handling middleware
app.use((err,req,res,next)=>{
    console.log("-----ERROR-----");
    let{status=500, message="NOT FOUND"}=err;
    res.render("error.ejs",{err});
})


app.listen(8000,()=>{
    console.log("app is listening at port 8000");
})