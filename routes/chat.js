import express from "express";
import app from "../app.js";
import functions from "../components/functions.js";

const router = express.Router();

// This router serves under /chat
router.get("/", (req, res) => {

    if (req?.session?.user?.valid !== true) return res.status(401).redirect("/");

    const chat = {};

    if (typeof req.query?.email === "string") {
        try {
            const { email } = req.query;ä
            const publicInfo = functions.getPublicInfo(email);
            const chatHistory = functions.getChatHistory(req.session.user.email, email);
            const roomKey = functions.getRoomKey(req.session.user.email, email);

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
        ORIGIN: req.protocol + '://' + req.get('host'),
        path: req.url,
        date: "Fri May 24 2024 18:35:02 GMT+0200 (Mitteleuropäische Sommerzeit)",
        title: "Home",
        desc: "Hier siehst du alle deine Chats auf einem Blick.",
        user: req.session.user,
        chat
    });
});

router.get("/:email", (req, res) => res.status(301).redirect("/chat?email=" + req.params.email));

export default router;