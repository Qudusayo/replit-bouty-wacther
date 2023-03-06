const express = require("express");
const mongoose = require("mongoose");

// Path to the scheduled function(s)
const scheduledFunctions = require("./scheduledFunctions");
const app = express();
app.set("port", process.env.PORT || 3000);

// ADD CALL to execute your function(s)
scheduledFunctions.initScheduledJobs();

app.listen(app.get("port"), () => {
  console.log("Express server listening on port " + app.get("port"));
});
