const express = require("express");
const db = require("./db");
const cors = require("cors");
const https = require("https");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded());

db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.listen(5000, () => console.log("Server is running on port 5000"));
