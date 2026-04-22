const Joi= require("joi");
const mongoose= require("mongoose");
module.exports.songSchema= Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        thumbnail:Joi.string().required(),
    }).required()
})