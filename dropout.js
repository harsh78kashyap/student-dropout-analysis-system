const mongoose=require("mongoose");

const dropoutschema=new mongoose.Schema({
    Session:String,
    TotalStu:Number,
    DropoutStu:Number,
    State:[{name:String,male:Number,female:Number,kaksha:Array}],
    Class:[{name:Number,count:Number}],
    Gender:[{name:String,count:Number}],
    Caste:[{name:String,count:Number}]
    },
    {
        collection:'dropout',
        versionKey: false
});


module.exports=mongoose.model("dropout",dropoutschema);