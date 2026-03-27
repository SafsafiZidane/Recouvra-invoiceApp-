const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const clientroutes = require('./routes/clientRoutes');
const cookieParser = require("cookie-parser");


const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/client/", clientroutes );

module.exports = app;
