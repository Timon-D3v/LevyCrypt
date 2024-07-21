import express from "express";
import { keys, onlineUsers } from "../app.js";
import { getPublicInfo } from "../components/functions.js";
import { element } from "three/examples/jsm/nodes/Nodes.js";

const router = express.Router();

// This router serves under /security
router.post("/get-public-key", (req, res) => {
    res.json({publicKey: keys.publicKey});
});

router.post("/get-user-data", (req, res) => {
    res.json(typeof req.session.user === "object" ? req.session.user : {valid: false});
});

router.post("/get-public-info", async (req, res) => {
    const user = await getPublicInfo(req.body.email);
    user.online = false;
    onlineUsers.forEach(element => {
        if (element.email !== user.email) return;
        user.publicKey = element.publicKey;
        user.online = true;
    });
    res.json(user);
});

export default router;