import express from "express";
import route2FA from "./2fa.js";
import { keys, onlineUsers } from "../app.js";
import functions from "../components/functions.js";
import { getAllEmails, getAccountWithEmail } from "../database/database.js";

const router = express.Router();

// This router serves under /auth
router.post("/login", async (req, res) => {
    
    if (req?.session?.user?.valid === true) return res.status(401).json({message: "Du bist schon eingeloggt.", valid: false});

    try {
        
        const { email, password, publicKey } = req.body;
        const decryptedPassword = functions.decryptMessage(password, await functions.importJWK(keys.privateKey, true));
        const valid = await functions.validateLogin(email, decryptedPassword);

        if (valid) {

            req.session.auth = await getAccountWithEmail(email);
            req.session.auth.publicKey = publicKey;
            req.session.auth.needs2FA = true;
            req.session.auth.needsPassword = false;
            
            delete req.session.auth.password;
            delete req.session.auth.id;

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
    if (req?.session?.user?.valid === true) return res.status(401).json({message: "Du bist schon eingeloggt.", valid: false});
    try {
        const { email, password, name, family_name, picture, publicKey } = req.body;

        if (!functions.validateEmail(email)) {
            return res.json({message: "Bitte gib eine gültige E-Mail-Adresse ein.", valid: false});
        }

        const emails = await getAllEmails();
        if (emails.includes(email)) {
            return res.json({message: "Dieser Benutzername ist schon vergeben, bitte such dir einen anderen aus.", valid: false});
        }

        const decryptedPassword = functions.decryptMessage(password, keys.privateKey);
        const valid = await functions.signUp(email, decryptedPassword, name, family_name, picture);
        if (valid) {
            req.session.auth = await getAccountWithEmail(email);
            req.session.auth.needs2FA = true;
            req.session.auth.needsPassword = false;
            req.session.auth.publicKey = publicKey;

            delete req.session.auth.password;
            delete req.session.auth.id;

            res.json({message: "Dein Account wurde erfolgreich erstellt.", valid: true});
        } else {
            res.json({message: "Dein Account konnte nicht erstellt werden, bitte überprüfe deine Angaben und versuche es erneut.", valid: false});
        };
    } catch (err) {
        console.error(err.message);
        res.json({message: err.message, valid: false});
    }
});

router.get("/logout", (req, res) => {
    if (req?.session?.user?.valid !== true) return res.status(401).json({message: "Du bist nicht eingeloggt.", valid: false});
    try {
        const index = onlineUsers.findIndex(user => user.email === req.session.user.email);
        if (index !== -1) onlineUsers.splice(index, 1);
        req.session.user = {};
        req.session.auth = {};
        res.json({message: "Du hast dich erfolgreich ausgeloggt.", valid: true});
    } catch (err) {
        console.error(err.message);
        res.json({message: err.message, valid: false});
    }
});

router.use("/2fa", route2FA);

export default router;