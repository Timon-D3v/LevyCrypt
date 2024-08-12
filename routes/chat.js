import express from "express";
import app from "../app.js";
import functions from "../components/functions.js";
import { getChatHistory } from "../database/database.js";

const router = express.Router();

// This router serves under /chat
router.get("/", async (req, res) => {

    if (req?.session?.user?.valid !== true) return res.status(401).redirect("/");

    const chat = {};

    if (typeof req.query?.email === "string") {
        try {
            const { email } = req.query;
            const userPublicKey = await functions.importJWK(req.session.user.publicKey);
            const publicInfo = await functions.getPublicInfo(email);
            const chatHistory = await getChatHistory(req.session.user.email, email);

            chatHistory.forEach(chat => {
                delete chat.id;
            });
            const { encrypted, symmetricKey, iv } = await functions.cipherEncrypt(JSON.stringify(chatHistory));

            chat.email = email;
            chat.publicInfo = publicInfo;
            chat.chatHistory = encrypted;
            chat.security = {
                symmetricKey: await functions.encryptMessage(symmetricKey, userPublicKey),
                iv: await functions.encryptMessage(iv, userPublicKey)
            };
            chat.open = true;
        } catch (err) {
            console.error(err);
            chat.open = false;
        }
    } else {
        chat.open = false;
    }

    res.render("chat.ejs", {
        ENVIRONMENT: app.ENVIRONMENT,
        PORT: app.PORT,
        ORIGIN: req.protocol + "://" + req.get("host"),
        path: req.baseUrl + req.url,
        date: "Fri May 24 2024 18:35:02 GMT+0200 (Mitteleuropäische Sommerzeit)",
        title: chat.open ? "Chat | " + chat.publicInfo.name : "Home | " + req.session.user.name,
        desc: "Hier siehst du alle deine Chats auf einem Blick.",
        user: req.session.user,
        chat
    });
});

router.get("/:email", (req, res) => res.status(301).redirect("/chat?email=" + req.params.email));

export default router;