import express from "express";
import functions from "../components/functions.js";

const router = express.Router();

// This router serves under /auth/2fa/
router.post("/sendCode", async (req, res) => {
    
    if (req?.session?.user?.valid === true) return res.status(401).json({message: "Du bist schon eingeloggt.", valid: false});
    if (req?.session?.auth?.needsPassword === true) return res.status(401).json({message: "Du musst zuerst dein Passwort eingeben.", valid: false});
    if (req?.session?.auth?.needs2FA === false) return res.status(401).json({message: "Du hast dich schon verifiziert.", valid: false});

    try {
        const { email } = req.session.auth;

        let code = "";

        for (let i = 0; i < 6; i++) {
            code += functions.getRandomInt(0, 9).toString();
        }

        req.session.auth.code_2fa = code;

        await functions.send2FARequest(email, code);

        res.json({message: "Code wurde gesendet.", valid: true});
        
    } catch (err) {
        console.error(err.message);
        res.json({message: err.message, valid: false});
    }
});

router.post("/verifyCode", async (req, res) => {

    if (req?.session?.user?.valid === true) return res.status(401).json({message: "Du bist schon eingeloggt.", valid: false});
    if (req?.session?.auth?.needsPassword === true) return res.status(401).json({message: "Du musst zuerst dein Passwort eingeben.", valid: false});
    if (req?.session?.auth?.needs2FA === false) return res.status(401).json({message: "Du hast dich schon verifiziert.", valid: false});

    try {
        const { email, code } = req.body;
        console.log(req.body);

        if (req.session.auth.code_2fa === code && req.session.auth.email === email) {
            req.session.auth.needs2FA = false;
            req.session.user = req.session.auth;
            
            req.session.user.valid = true;
            delete req.session.auth;
            delete req.session.user.code_2fa;
            delete req.session.user.needs2FA;
            delete req.session.user.needsPassword;

            res.json({message: "Erfolgreich verifiziert.", valid: true});
        } else {
            res.json({message: "Dieser Code ist leider falsch.", valid: false});
        }
    } catch (err) {
        console.error(err.message);
        res.json({message: err.message, valid: false});
    }
});

export default router;