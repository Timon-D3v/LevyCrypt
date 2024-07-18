import express from "express";
import app from "../app.js";
import { getFile, encryptBase64, importJWK } from "../components/functions.js";



const router = express.Router();

// This router serves under /models
router.get("/:name", async (req, res) => {
    
    if (!req.session?.user?.valid) return res.status(302).redirect("/");

    const response = await getFile(req.session.user.email, req.params.name);
    
    if (!response) return res.status(400).end();

    const encryptedBase64 = await encryptBase64(response.base64, await importJWK(req.session.user.publicKey));

    res.render("models.ejs", {
        ENVIRONMENT: app.ENVIRONMENT,
        PORT: app.PORT,
        ORIGIN: req.protocol + "://" + req.get("host"),
        path: req.url,
        date: "Thu Jul 18 2024 10:48:21 GMT+0200 (Mitteleuropäische Sommerzeit)",
        title: "3d-Model",
        desc: "This site shows a 3d model",
        user: req.session.user,
        base64: JSON.stringify(encryptedBase64),
    });
});

export default router;