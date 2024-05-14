import timon, { post, getElm, getQuery } from "timonjs";
import crypto from "./crypto.js";

async function login(username, password) {
    const decryptedPassword = await crypto.clientEncrypt(password);
    const res = await post("/auth/login", {
        username,
        password: decryptedPassword
    });
    if (res.valid) {
        timon.successField("Du bist jetzt eingeloggt.", 100000);
    } else {
        timon.errorField(res.message);
    };
}

export default {
    login
};

export {
    login
};