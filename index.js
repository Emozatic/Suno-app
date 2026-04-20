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
    next();
})

//index.route
app.get("/home",wrapAsync(async(req,res)=>{
    let songListing= await SongListing.find({});
    console.log(songListing);
    res.render("home.ejs",{songListing});
}))

//render new form
app.get("/new",wrapAsync(async(req,res)=>{
    res.render("new.ejs");
}))

//post new form
app.post("/home",validateSong,wrapAsync(async(req,res)=>{
    let newData=req.body;
    let newSongListing = new SongListing(newData);
    await newSongListing.save()
    req.flash("success","new Song uploaded");
    res.redirect("/home");
}))

//show route
app.get("/show/:id",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    let songDetails= await SongListing.findById(id);
    res.render("show.ejs",{songDetails});
}))

//render edit form
app.get("/show/:id/edit",wrapAsync(async (req,res)=>{
    let{id}=req.params;
    let songDetails= await SongListing.findById(id);
    res.render("edit.ejs",{songDetails});
}))

//post edit form
app.put("/show/:id",validateSong,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await SongListing.findByIdAndUpdate(id,{...req.body});
    req.flash("success","Song's Details edit successfully");
    res.redirect(`/show/${id}`);
}))

//delete route
app.delete("/show/:id",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await SongListing.findByIdAndDelete(id);
    req.flash("success","Track Deleted successfully");
    res.redirect("/home");
}));


//error handling middleware
app.use((err,req,res,next)=>{
    console.log("-----ERROR-----");
    let{status=500, message="NOT FOUND"}=err;
    res.render("error.ejs",{err});
})


app.listen(8000,()=>{
    console.log("app is listening at port 8000");
})