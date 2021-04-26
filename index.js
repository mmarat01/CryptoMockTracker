const express = require("express");
const db = require("./server/db");
const cors = require("cors");
const https = require("https");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(express.static("client"));

db.on("error", console.error.bind(console, "MongoDB connection error:"));

const apiPort = process.evn.PORT || 3000;
app.listen(apiPort, () => console.log(`Server is running on port ${apiPort}`));
