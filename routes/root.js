import express from "express";
import { ENVIRONMENT, PORT } from "../app.js";

const router = express.Router();

// This router serves under /
router.get("/", (req, res) => {

    if (req?.session?.user?.valid) return res.redirect("/chat");
    
    res.render("index.ejs", {
        ENVIRONMENT: ENVIRONMENT,
        PORT: PORT,
        ORIGIN: req.protocol + "://" + req.get("host"),
        path: req.url,
        date: "Mon Apr 01 2024 00:20:31 GMT+0200 (Mitteleuropäische Sommerzeit)",
        title: "Home",
        desc: "Das ist die Landeseite von Timon's 3D-Chat-App.",
        user: req.session.user
    });
});

export default router;