// Packages
import session from "express-session";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import timon from "timonjs";
import https from "https";
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



// Constants 
const ENVIRONMENT = "dev" // "prod" or "dev"
const CERT = ENVIRONMENT === "prod" ? {
    COM: {
        key: fs.readFileSync("./cert/com/private.key.pem"),
        cert: fs.readFileSync("./cert/com/domain.crt.pem")
    },
    VIP: {
        key: fs.readFileSync("./cert/vip/private.key.pem"),
        cert: fs.readFileSync("./cert/vip/domain.cert.pem"),
        ca: fs.readFileSync("./cert/vip/intermediate.cert.pem")
    },
    LEVY: {
        key: fs.readFileSync("./cert/levycrypt/private.key.pem"),
        cert: fs.readFileSync("./cert/levycrypt/certificate.crt.pem")
    }
} : undefined;
const PORT = ENVIRONMENT === "prod" ? 443 : 8080;
const app = express();
const server = ENVIRONMENT === "prod" ? https.createServer(CERT.COM, app) : http.createServer(app);
const io = new socket.Server(server, {
    cors: {
        origin: [
            "https://localhost",
            "https://127.0.0.1",
            "https://timondev.vip",
            "https://timondev.com",
            "https://levycrypt.com",
            "https://www.timondev.vip",
            "https://www.timondev.com",
            "https://www.levycrypt.com"
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
dotenv.config();



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

server.listen(PORT, () => {
    if (ENVIRONMENT === "prod") {
        server.addContext("timondev.vip", CERT.VIP);
        server.addContext("timondev.com", CERT.COM);
        server.addContext("levycrypt.com", CERT.LEVY);
        server.addContext("www.timondev.vip", CERT.VIP);
        server.addContext("www.timondev.com", CERT.COM);
        server.addContext("www.levycrypt.com", CERT.LEVY);
    }
    const protocol = ENVIRONMENT === "prod" ? "HTTPS" : "HTTP";
    console.log(`\x1b[34m%s\x1b[0m`, `${protocol} Server running on ${protocol}://localhost:${PORT}`);
});