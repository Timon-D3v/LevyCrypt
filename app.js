// Packages
import session from "express-session";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import https from "https";
import timon from "timonjs";
import http from "http";
import cors from "cors";
import fs from "fs";
import crypto from "crypto";
import * as socket from "socket.io";

// Custom components
import functions from "./components/functions.js";
import ioConnect from "./components/events.js";

// Routes
import routeRoot from "./routes/root.js";
import routeModules from "./routes/modules.js";



// Constants 
const ENVIRONMENT = "dev" // || "prod"
const HTTPS_CERT = {
    key: fs.readFileSync("./cert/private.key.pem"),
    cert: fs.readFileSync("./cert/domain.cert.pem"),
    ca: fs.readFileSync("./cert/intermediate.cert.pem"),
};
const PORT = ENVIRONMENT === "prod" ? 443 : 8080;
const app = express();
const server = http.createServer(app);
const io = new socket.Server(server, {
    cors: "timondev.vip, localhost"
});



// Export constants
export default {
    ENVIRONMENT: ENVIRONMENT,
    PORT: PORT,
    app: app,
    server: server,
    io: io
};

export {
    ENVIRONMENT,
    PORT,
    app,
    server,
    io
};



// Configure app and dotenv
app.set("view engine", "ejs");
dotenv.config();



// Set up morgan aka log
app.use(morgan("[:date[web]] :status :method :url | :total-time[3]ms | :remote-addr | :http-version :referrer |"));
if (ENVIRONMENT === "prod") {
    let date = new Date().toLocaleDateString("en-US", {year: "2-digit", month: "2-digit", day: "2-digit"});
    date = date.slice(6, 8) + date.slice(3, 5) + date.slice(0, 2);
    fs.writeFile(`./logs/log_${date}.log`, "", err => {throw new Error(err);});
    app.use(morgan("[:date[web]] :status :method :url | :total-time[3]ms | :remote-addr | :http-version :referrer |", {
        stream: fs.createWriteStream(`./logs/log_${date}.log`, {flags: "w"})
    }));
};



// Set up App
app.use(express.static("./public"));
app.use(express.urlencoded({
    extended: true,
    limit: "1000mb"
}));
app.use(express.json({
    limit: '1000mb'
}));
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 432000000
    }
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());



// Set up routes
app.use("/components", routeModules);
app.use("/", routeRoot);

// Set up websocket
io.on("connection", ioConnect);


if (ENVIRONMENT === "prod") {
    const https_server = https.createServer(HTTPS_CERT, server);
    https_server.listen(PORT, () => console.log("\x1b[34m%s\x1b[0m", `HTTPS Server running on http://localhost:${PORT}`));
} else {
    server.listen(PORT, () => console.log("\x1b[35m%s\x1b[0m", `Dev Server running on http://localhost:${PORT}`));
};