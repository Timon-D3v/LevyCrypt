import express from "express";
import { keys, onlineUsers } from "../app.js";
import { getPublicInfo, getAllChatPartners, getLastMessages, encryptLongText, importJWK } from "../components/functions.js";
import { searchForUsers } from "../database/database.js";

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

router.post("/get-nav-messages", async (req, res) => {

    if (req?.session?.user?.valid !== true) return res.status(401).redirect("/");

    const { email, publicKey } = req.session.user;
    
    const partners = await getAllChatPartners(email);

    const messages = await getLastMessages(email, partners);

    const encrypted = await encryptLongText(JSON.stringify(messages), await importJWK(publicKey));

    res.json({ encrypted });
});

router.post("/get-users-where", async (req, res) => {
    const { input } = req.body;
    const data = await searchForUsers(input);
    res.json({ data });
});

export default router;