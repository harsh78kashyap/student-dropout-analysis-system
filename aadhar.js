const mongoose=require("mongoose");

const aadharschema=new mongoose.Schema({
    AadharNo:Number,
    Name:String,
    Gender:String,
    Dob:Date,
    FatherName:String,
    Caste:String,
    SubDistrict:String,
    State:String,
    District:String,
    Pin:Number,
    EnrolmentAgency:String,
    Registrar:String},
    {
        collection:'aadhar',
        versionKey: false
});


module.exports=mongoose.model("aadhar",aadharschema);