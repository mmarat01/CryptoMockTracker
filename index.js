const express = require("express");
const db = require("./server/db");
const cors = require("cors");
const https = require("https");
const path = require("path");
const userRouter = require("./server/routes/user-router.js");
const cryptoRouter = require("./server/routes/crypto-router.js");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "client")));
app.use("/api/user", userRouter);
app.use("/api/crypto", cryptoRouter);

db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.get("/mijael", (req, res) => {
  res.send("habla causita");
});

app.listen(process.env.PORT || 3000, () => console.log("Server is running!"));
