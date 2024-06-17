import express from "express";
import { keys } from "../app.js";
import { getPublicInfo } from "../components/functions.js";

const router = express.Router();

// This router serves under /security
router.post("/get-public-key", (req, res) => {
    res.json({publicKey: keys.publicKey});
});

router.post("/get-user-data", (req, res) => {
    res.json(typeof req.session.user === "object" ? req.session.user : {valid: false});
});

router.post("/get-public-info", async (req, res) => {
    res.json(await getPublicInfo(req.body.email));
});

export default router;