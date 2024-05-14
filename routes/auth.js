import express from "express";
import app from "../app.js";
import functions from "../components/functions.js";

const router = express.Router();

// This router serves under /auth
router.post("/login", async (req, res) => {
    if (req.session?.user?.valid) return res.json({message: "Du bist schon eingeloggt.", valid: false});
    try {
        const { username, password } = req.body;
        const decryptedPassword = functions.decryptMessage(password, app.keys.privateKey);
        const valid = await functions.validateLogin(username, decryptedPassword);
        if (valid) {
            res.json({message: "Login successful", valid: true});
        } else {
            res.json({message: "Dein Passwort stimmt nicht mit dem Benutzername überein.", valid: false});
        };
    } catch (err) {
        console.error(err.message);
        res.json({message: err.message, valid: false});
    };
});

export default router;