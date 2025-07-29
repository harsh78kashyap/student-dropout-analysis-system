const express = require("express");
const path = require("path")
const bodyParser = require("body-parser");
const sessions = require('express-session');

const school = require("./server/school");
const student = require("./server/student");
const aadhar = require("./server/aadhar");
const dropout = require("./server/dropout");
require("./server/config");
const app = express();

const publicPath = path.join(__dirname, 'public');


//Use App
app.use(
  sessions({
    secret: 'some secret',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    resave: true,
    saveUninitialized: false,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(express.json());
app.set("view engine", "ejs");



//GET METHODS
app.get("/", (req, res) => {
  req.session.destroy();
  res.render(__dirname + '/index');
})

app.get("/contact",(req,res)=>{
  res.render(__dirname + '/public/ContactPage');
})

app.get("/about",(req,res)=>{
  res.render(__dirname + '/public/AboutPage');
})

app.get("/viewstudentdetails", async (req, res) => {
  const schol = await student.find({ "SchoolID": req.session.userid }).sort({ Name:1, AadharNo: 1 });
  res.render(__dirname + "/public/ViewStudentDetails", {
    schol: schol,
  });
});

app.get("/ViewSchoolDetails", async (req, res) => {
  const schol = await school.find().sort({SchoolID:1});
  res.render(__dirname + "/public/SchoolDetails", {
    schol: schol,
  });
});

app.get("/StudentRegistration", (req, res) => {
  res.render(__dirname + '/public/Registration');
});

app.get("/StudentReadmissions", async (req, res) => {
  const schol = await student.find({ "SchoolID": req.session.userid, "updated": false }).sort({ Class: 1, AadharNo: 1 });
  res.render(__dirname + "/public/ReadmittedStudents", {
    schol: schol,
  });
});

app.get("/SchoolRegistration", async(req, res) => {
  const temp=await school.find().count();
  res.render(__dirname + "/public/SchoolRegistration",
  {t:temp+1,}
  );
});

app.get("/currentdropout", async (req, res) => {
  const TotalDropoutStu = await student.find({ "updated": false }).sort({"Class":1,"State":1,"Caste":1});
  const StudentNo = await student.countDocuments();
  let temp = []
  let state = []
  let kaksha = []
  let gender = []
  let caste = []

  for (var i = 0; i < TotalDropoutStu.length; i++) {
    if (temp.indexOf(TotalDropoutStu[i].State) == -1) {
      temp.push(TotalDropoutStu[i].State);
      var _data = {};
      _data.name = TotalDropoutStu[i].State;
      _data.kaksha=Array(18).fill(0);
      if(TotalDropoutStu[i].Gender=="M"){
        _data.male=1;
        _data.female=0;
        _data.kaksha[TotalDropoutStu[i].Class-1]=1;
      }else{
        _data.male=0;
        _data.female=1;
        _data.kaksha[TotalDropoutStu[i].Class+8]=1;
      }
      

      state.push(_data);
    } else {
      for (var j = 0; j < state.length; j++) {
        if (state[j].name === TotalDropoutStu[i].State) {
          let _y=parseInt(state[j].male);
          let _z=parseInt(state[j].female);
          let _x;
          if(TotalDropoutStu[i].Gender=="M"){
            _y+=1;
            state[j].kaksha[TotalDropoutStu[i].Class-1]+=1
          }else{
            _z+=1;
            state[j].kaksha[TotalDropoutStu[i].Class+8]+=1

          }
          
          
          state[j].male=_y;
          state[j].female=_z;
        }
      }
    }
    if (temp.indexOf(TotalDropoutStu[i].Class) == -1) {
      temp.push(TotalDropoutStu[i].Class);
      var _data = {};
      _data.name = TotalDropoutStu[i].Class;
      _data.count = 1;

      kaksha.push(_data);
    } else {
      for (var j = 0; j < kaksha.length; j++) {
        if (kaksha[j].name === TotalDropoutStu[i].Class) {
          let _x = parseInt(kaksha[j].count) + 1;
          kaksha[j].count = _x;
        }
      }
    }
    if (temp.indexOf(TotalDropoutStu[i].Gender) == -1) {
      temp.push(TotalDropoutStu[i].Gender);
      var _data = {};
      _data.name = TotalDropoutStu[i].Gender;
      _data.count = 1;

      gender.push(_data);
    } else {
      for (var j = 0; j < gender.length; j++) {
        if (gender[j].name === TotalDropoutStu[i].Gender) {
          let _x = parseInt(gender[j].count) + 1;
          gender[j].count = _x;
        }
      }
    }
    if (temp.indexOf(TotalDropoutStu[i].Caste) == -1) {
      temp.push(TotalDropoutStu[i].Caste);
      var _data = {};
      _data.name = TotalDropoutStu[i].Caste;
      _data.count = 1;

      caste.push(_data);
    } else {
      for (var j = 0; j < caste.length; j++) {
        if (caste[j].name === TotalDropoutStu[i].Caste) {
          let _x = parseInt(caste[j].count) + 1;
          caste[j].count = _x;
        }
      }
    }
  }
  const ans = {
    user: req.session.userid,
    TStu: StudentNo,
    DStu: TotalDropoutStu.length,
    state: state,
    kaksha: kaksha,
    gender: gender,
    caste: caste
  }
  if(req.session.userid=="admin"){
  req.session.state = state;
  req.session.kaksha = kaksha;
  req.session.gender = gender;
  req.session.caste = caste;
}
  res.render(__dirname + "/public/CurrentDropout", {
    ans: ans
  });

});

app.get("/DropoutDataset", async (req, res) => {
  const schol = await student.find({ "updated": false }).sort({ "AadharNo": 1 });
  res.render(__dirname + "/public/DropoutDataset", {
    schol: schol,
  });
});

app.get("/PreviousDropout", async(req,res)=>{
  const stu=await dropout.find({},{"Session":1});
  res.render(__dirname + "/public/PreviousDropout",{
    ans:stu
  });
});


//POST METHODS
app.post("/schoollogin", async (req, res) => {
  const temp = await school.findOne(req.body);
  if (temp != null) {
    req.session.userid = req.body.SchoolID;
    res.render(__dirname + "/public/SchoolPortal", {
      schol: temp,
    });
  } else {
    const ans = {
      title: "Invaild Credentials",
      body: "Entered wrong ID or Password"
    }
    res.render(__dirname + "/public/WrongUserPass", {
      ans: ans
    });
  }
});

app.post("/adminlogin", async (req, res) => {
  let temp = false;
  if (req.body.adminame == "admin" && req.body.password == "100") {
    temp = true;
  }
  if (temp) {
    req.session.userid = req.body.adminame;
    res.render(__dirname + "/public/AdminPortal");
  } else {
    const ans = {
      title: "Invaild Credentials",
      body: "Entered wrong ID or Password"
    }
    res.render(__dirname + "/public/WrongUserPass", {
      ans: ans
    });
  }
});

app.post("/govtlogin", async (req, res) => {
  let temp = false;
  if (req.body.password == "100") {
    temp = true;
  }
  if (temp) {
    req.session.userid = req.body.adminame;
    res.render(__dirname + "/public/GovPortal");
  } else {
    const ans = {
      title: "Invaild Credentials",
      body: "Entered wrong ID or Password"
    }
    res.render(__dirname + "/public/WrongUserPass", {
      ans: ans
    });
  }
});

app.post("/readmittedstudentupdate", async (req, res) => {
  if (req.body.readmit == null) {

  } else {
    await student.updateMany({ "AadharNo": { "$in": req.body.readmit } }, { "$set": { "updated": true } })
  }
  res.redirect(req.get('referer'));

});

app.post("/NewAdmission", async (req, res) => {
  const temp = await aadhar.findOne({ "AadharNo": req.body.adhaar });
  if (temp.FatherName == req.body.fathername && temp.Gender==req.body.gender && req.body.caste==temp.Caste) {
    await student.updateOne({ "AadharNo": req.body.adhar },
      {
        "$set": {
          "AadharNo": req.body.adhar,
          "Name": req.body.name,
          "FatherName": req.body.fathername,
          "Caste": req.body.caste,
          "Class": req.body.class,
          "District": req.body.district,
          "Dob": req.body.birthday,
          "Gender": req.body.gender,
          "Pin": req.body.pincode,
          "State": req.body.state,
          "updated": true,
          "SchoolID": req.session.userid
        }
      }, { "upsert": true });
      res.redirect(req.get('referer'));
  }else{
    const ans = {
      title: "Authentication Failed",
      body: "Please check all the details again before submitting"
    }
    res.render(__dirname + "/public/WrongUserPass", {
      ans: ans
    });
  }
  
});

app.post("/NewSchoolRegistration", async (req, res) => {
  const temp = await school.findOne({ "SchoolID": req.body.id });
  if (temp == null && req.body.id>1) {
    await school.insertMany({
      "SchoolID": req.body.id,
      "SchoolName": req.body.name,
      "State": req.body.state,
      "District": req.body.district,
      "Block": req.body.block,
      "password": req.body.pass
    });
    res.redirect(req.get('referer'));
  }else if(req.body.id<1){
    const ans = {
      title: "School ID cannot be negetive",
      body: "Enter positive value for School ID"
    }
    res.render(__dirname + "/public/WrongUserPass", {
      ans: ans
    });
  }else{
    const ans = {
      title: "School ID Already exists",
      body: "Try to enter unique school ID value"
    }
    res.render(__dirname + "/public/WrongUserPass", {
      ans: ans
    });
  }
  
});

app.post("/UploadDropoutData", async (req, res) => {
  const data=await dropout.find({},{"Session": 1});
  for(let i=0;i<data.length;i++){
    if(data[i].Session==req.body.session){
      const ans = {
        title: "Invaild Session Name",
        body: "Session name already exist"
      }
      res.render(__dirname + "/public/WrongUserPass", {
        ans: ans
      });
      return;
    }
  }
  await dropout.insertMany({
    "Session":req.body.session,
    "TotalStu":req.body.Total,
    "DropoutStu":req.body.Dropout,
    "State":req.session.state,
    "Class":req.session.kaksha,
    "Gender":req.session.gender,
    "Caste":req.session.caste
  })
  res.redirect(req.get('referer'));
});

app.post("/ViewDropout",async(req,res)=>{
  const data=await dropout.findOne({"Session": req.body.Session});
  const ans = {
    ses:req.body.Session,
    TStu: data.TotalStu,
    DStu: data.DropoutStu,
    state: data.State,
    kaksha: data.Class,
    gender: data.Gender,
    caste: data.Caste
  }
res.render(__dirname +"/public/ViewDropout",{
  ans:ans
});
});

app.get("*", (req, res) => {
  res.render(__dirname + "/public/Error404");
});

app.listen(3000);