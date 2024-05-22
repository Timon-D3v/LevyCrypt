import express from "express";
import app from "../app.js";
import functions from "../components/functions.js";
import { getAllUsernames } from "../database/database.js";

const router = express.Router();

// This router serves under /auth
router.post("/login", async (req, res) => {
    if (req.session?.user?.valid) return res.json({message: "Du bist schon eingeloggt.", valid: false});
    try {
        const { username, password } = req.body;
        const decryptedPassword = functions.decryptMessage(password, app.keys.privateKey);
        const valid = await functions.validateLogin(username, decryptedPassword);
        if (valid) {
            res.json({message: "Du hast dich erfolgreich eingeloggt.", valid: true});
        } else {
            res.json({message: "Dein Passwort stimmt nicht mit dem Benutzername überein.", valid: false});
        }
    } catch (err) {
        console.error(err.message);
        res.json({message: err.message, valid: false});
    }
});

router.post("/signUp", async (req, res) => {
    if (req.session?.user?.valid) return res.json({message: "Du bist schon eingeloggt.", valid: false});
    try {
        const { username, password, name, family_name, picture } = req.body;

        const usernames = await getAllUsernames();
        if (usernames.includes(username)) {
            return res.json({message: "Dieser Benutzername ist schon vergeben, bitte such dir einen anderen aus.", valid: false});
        }

        const decryptedPassword = functions.decryptMessage(password, app.keys.privateKey);
        const valid = await functions.signUp(username, decryptedPassword, name, family_name, picture);
        if (valid) {
            res.json({message: "Dein Account wurde erfolgreich erstellt.", valid: true});
        } else {
            res.json({message: "Dein Account konnte nicht erstellt werden, bitte überprüfe deine Angaben und versuche es erneut.", valid: false});
        };
    } catch (err) {
        console.error(err.message);
        res.json({message: err.message, valid: false});
    }
});

export default router;