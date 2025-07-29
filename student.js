const mongoose=require("mongoose");

const studentschema=new mongoose.Schema({
    AadharNo:Number,
    Name:String,
    SchoolID:Number,
    Gender:String,
    Dob:Date,
    FatherName:String,
    Class:Number,
    Caste:String,
    State:String,
    District:String,
    Pin:Number,
    updated:Boolean},
    {
        collection:'student',
        versionKey: false
});


module.exports=mongoose.model("student",studentschema);