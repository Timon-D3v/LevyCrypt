import express from "express";
import { keys, onlineUsers } from "../app.js";
import functions from "../components/functions.js";
import { getAllEmails, getAccountWithEmail } from "../database/database.js";
//import abc from "jwk-to-pem";
import crypto from "crypto";

const router = express.Router();

// This router serves under /auth
router.post("/login", async (req, res) => {
    
    if (req?.session?.user?.valid === true) return res.status(401).json({message: "Du bist schon eingeloggt.", valid: false});

    try {
        
        const { email, password, publicKey } = req.body;
        const decryptedPassword = functions.decryptMessage(password, await functions.importJWK(keys.privateKey, true));
        const valid = await functions.validateLogin(email, decryptedPassword);

        if (valid) {

            req.session.user = await getAccountWithEmail(email);
            req.session.user.publicKey = publicKey;
            req.session.user.valid = true;
            
            delete req.session.user.password;
            delete req.session.user.id;

            onlineUsers.push(req.session.user.email);

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
        const { email, password, name, family_name, picture } = req.body;

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
            req.session.user = await getAccountWithEmail(email);
            req.session.user.valid = true;
            req.session.user.publicKey = req.body.publicKey;
            delete req.session.user.password;
            delete req.session.user.id;
            onlineUsers.push(req.session.user.email);
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
        res.json({message: "Du hast dich erfolgreich ausgeloggt.", valid: true});
    } catch (err) {
        console.error(err.message);
        res.json({message: err.message, valid: false});
    }
});

export default router;