const SongListing = require("./model/song");

module.exports.isloggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        console.log(req.originalUrl);
        req.flash("error","You must be logged In")
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
}

//checking isOwner or not
module.exports.isOwner= async(req,res,next)=>{
    let {id}= req.params;
    let songListing= await SongListing.findById(id);
    console.log(res.locals.currUser._id);
    if(!songListing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to do that");
        return res.redirect("/home");
    }
    next();
}