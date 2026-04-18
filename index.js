const express= require("express");
const app= express();
const mongoose= require("mongoose");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const SongListing= require("./model/song");


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

//test route
app.get("/test",(req,res)=>{
    
})

//index.route
app.get("/home",async(req,res)=>{
    let songListing= await SongListing.find({});
    console.log(songListing);
    res.render("home.ejs",{songListing});
})

//render new form
app.get("/new",async(req,res)=>{
    res.render("new.ejs");
})

//post new form
app.post("/home",async(req,res)=>{
    let newData=req.body;
    let newSongListing = new SongListing(newData);
    await newSongListing.save()
    res.redirect("/home");
})

app.listen(8000,()=>{
    console.log("app is listening at port 8000");
})