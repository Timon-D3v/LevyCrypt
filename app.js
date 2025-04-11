// Packages
import session from "express-session";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import http from "http";
import cors from "cors";
import fs from "fs";
import * as socket from "socket.io";

// Custom components
import ioConnect from "./components/events.js";
import keys from "./components/keys.js";
import Email from "./components/email.js";

// Routes
import routeRoot from "./routes/root.js";
import routeAuth from "./routes/auth.js";
import routeChat from "./routes/chat.js";
import routeModels from "./routes/models.js";
import routeUpload from "./routes/upload.js";
import routeSecurity from "./routes/security.js";


dotenv.config();


// Constants 
const ENVIRONMENT = process.env.ENV || "dev" // "prod" or "dev"
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";
const app = express();
const server = http.createServer(app);
const io = new socket.Server(server, {
    path: "/ws",
    cors: {
        origin: [
            "https://localhost",
            "https://127.0.0.1",
            "https://levycrypt.timondev.com",
            "https://levycrypt.com",
            "https://www.levycrypt.com",
            "http://localhost",
            "http://127.0.0.1",
            "http://levycrypt.timondev.com",
            "http://levycrypt.com",
            "http://www.levycrypt.com"
        ]
    }
});
const onlineUsers = [];



// Prepare Email
class Email2FA extends Email {
    constructor(CODE) {
        super(CODE, ENVIRONMENT === "prod" ? "https://www.levycrypt.com" : "http://localhost:8080");
    }
}



// Export constants
export default {
    ENVIRONMENT,
    PORT,
    app,
    server,
    io,
    keys,
    onlineUsers,
    Email2FA
};

export {
    ENVIRONMENT,
    PORT,
    app,
    server,
    io,
    keys,
    onlineUsers,
    Email2FA
};



// Configure app and dotenv
app.set("view engine", "ejs");



// Set up morgan aka log
app.use(morgan("[:date[web]] :status :method :url | :total-time[3]ms | :remote-addr | :http-version :referrer |"));
if (ENVIRONMENT === "prod") {
    let date = new Date().toLocaleDateString("en-US", {year: "2-digit", month: "2-digit", day: "2-digit"});
    date = date.slice(6, 8) + date.slice(3, 5) + date.slice(0, 2);
    fs.writeFile(`./logs/log_${date}.log`, "", err => {if (err) throw new Error(err);});
    app.use(morgan("[:date[web]] :status :method :url | :total-time[3]ms | :remote-addr | :http-version :referrer |", {
        stream: fs.createWriteStream(`./logs/log_${date}.log`, {flags: "w"})
    }));
};



// Set up for host behind proxy
app.use((req, res, next) => {
    const bind = req.get.bind(req);
    req.get = query => {
        if (query === "host") {
            return ENVIRONMENT === "prod" ? "www.levycrypt.com" : bind("host");
        }
        return bind(query);
    }
    next();
});



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
        httpOnly: false,
        maxAge: 432000000
    }
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());



// Set up routes
app.use("/", routeRoot);
app.use("/auth", routeAuth);
app.use("/chat", routeChat);
app.use("/models", routeModels);
app.use("/upload", routeUpload);
app.use("/security", routeSecurity);

app.get("*", (req, res) => res.status(404).redirect("/"));
app.post("*", (req, res) => res.status(404).json({message: "Endpoint not found!"}));

// Set up websocket
io.on("connection", ioConnect);


server.listen(PORT, HOST, () => console.log(`App running on ${HOST}:${PORT}`));