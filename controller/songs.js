const SongListing= require("../model/song.js")

//home route
module.exports.home=async(req,res)=>{
    let songListing= await SongListing.find({});
    console.log(songListing);
    res.render("home.ejs",{songListing});
};

//render new form
module.exports.renderNewForm=async(req,res)=>{
    res.render("new.ejs");
};

//post new form
module.exports.postNewForm=async(req,res)=>{
    let newData=req.body;
    let newSongListing = new SongListing(newData);
    newSongListing.owner= req.user._id;
    await newSongListing.save()
    req.flash("success","new Song uploaded");
    res.redirect("/home");
};


//show route
module.exports.show=async(req,res)=>{
    let{id}=req.params;
    let songDetails= await SongListing.findById(id);
    res.render("show.ejs",{songDetails});
};

//render edit form
module.exports.renderEditForm=async (req,res)=>{
    let{id}=req.params;
    let songDetails= await SongListing.findById(id);
    res.render("edit.ejs",{songDetails});
};

//post edit form
module.exports.postEditFomr=async(req,res)=>{
    let {id}= req.params;
    await SongListing.findByIdAndUpdate(id,{...req.body});
    req.flash("success","Song's Details edit successfully");
    res.redirect(`/show/${id}`);
};

//destroy route
module.exports.deleteSong=async(req,res)=>{
    let {id}= req.params;
    await SongListing.findByIdAndDelete(id);
    req.flash("success","Track Deleted successfully");
    res.redirect("/home");
};