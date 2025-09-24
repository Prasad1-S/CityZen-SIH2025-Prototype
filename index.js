import express from "express";
const port = process.env.PORT || 3000;
const app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));



app.get("/",(req,res)=>{
   res.render("citizzen");
});

var report = 1101;

const WasteComplaints =[];
const PotholeComplaints =[];
const ElectricityComplaints =[];
const WardComplaints =[];

function classifyComplaint(description) {
  const text = description.toLowerCase(); // make case-insensitive

  // Keywords for each category
  const electricityKeywords = ["light", "electric", "wire", "power", "transformer"];
  const potholeKeywords = ["pothole", "road", "hole", "crack", "damaged"];
  const wasteKeywords = ["garbage", "waste", "trash", "dustbin", "dump"];

  // Check Electricity
  if (electricityKeywords.some(word => text.includes(word))) {
    return "Electricity";
  }

  // Check Pothole
  if (potholeKeywords.some(word => text.includes(word))) {
    return "Pothole";
  }

  // Check Waste
  if (wasteKeywords.some(word => text.includes(word))) {
    return "Waste";
  }

  // Default case if no keywords matched
  return "Other / Unknown";
}

async function getAddress(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

  const res = await fetch(url);
  const data = await res.json();

  console.log("Full address:", data.display_name);
  console.log("City:", data.address.city || data.address.town);
  console.log("District/Ward:", data.address.city_district || data.address.suburb);
  return data.display_name;
}



app.post("/submit", async(req, res) => {
  // Access description directly
  const description = req.body.description;
  const phone = req.body.reporterPhone;
  const location = req.body.location;
  const lat = req.body.latitude;
  const lon = req.body.longitude;
  const area = await getAddress(lat, lon);
  let dept = "";
  let compNum = 0; 
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });


   var category = classifyComplaint(description);
   
   if(category=="Pothole"){
      const NewComplaint ={
         id: PotholeComplaints.length +1,
         description,
         phone,
         category:"Pothole Isuue",
         submissionDate:formattedDate,
         location,
         area,
         lat,
         lon,
         status:'pending'
      }
      dept = "PO";
      compNum = PotholeComplaints.length +1;
      PotholeComplaints.push(NewComplaint);
      console.log(PotholeComplaints);
      // do something
   }else if(category=="Electricity"){
      const NewComplaint ={
         id: ElectricityComplaints.length +1,
         description,
         phone,
         category:"Electricity Isuue",
         location,
         submissionDate:formattedDate,
         area,
         lat,
         lon,
         status:'pending'
      }
      dept = "EL";
      compNum = PotholeComplaints.length +1;
      ElectricityComplaints.push(NewComplaint);
      console.log(ElectricityComplaints);
      // something
   }else if(category=="Waste"){
      const NewComplaint ={
         id: WasteComplaints.length +1,
         description,
         phone,
         category:"Garbage Isuue",
         location,
         submissionDate:formattedDate,
         area,
         lat,
         lon,
         status:'pending'
      }
      dept = "SW";
      compNum = PotholeComplaints.length +1;
      WasteComplaints.push(NewComplaint);
      console.log(WasteComplaints);
      // something
   }
   let compID = `${dept}-2025-0${compNum}`;
  res.render("complaint",{
   complaintID:compID
  });
});

app.get("/track-status",(req,res)=>{
   res.render("track");
});

app.get("/waste",(req,res)=>{
   res.render("solidWaste", {
      complaints:WasteComplaints
   });
});

app.get("/ward",(req,res)=>{
   res.render("ward");
});

app.get("/electricity",(req,res)=>{
   res.render("electricity",{
      complaints:ElectricityComplaints
   });
});


app.get("/pothole",(req,res)=>{
   res.render("pothole",{
      complaints:PotholeComplaints
   });
});


app.get("/track/:id", async (req, res) => {
    let idx = req.params.id;
    let dept = idx.slice(0, 2);
    idx = Number(idx.substring(9));
    console.log(idx, dept);
    let complaintstatus;

    if(dept == "EL"){
      complaintstatus = ElectricityComplaints[idx-1];

      console.log(complaintstatus);
    }else if(dept == "PO"){
      complaintstatus = PotholeComplaints[idx-1];
    }else if(dept == "SW"){
      complaintstatus = WasteComplaints[idx-1];
    }

    res.render("track", { complaintstatus, deptt:dept });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 