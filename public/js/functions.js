import timon, { post, getElm, getQuery } from "timonjs";
import crypto from "./crypto.js";

/**
 * Asynchronous function to log in a user with the provided username and password.
 * 
 * @param {string} username - The username of the user trying to log in.
 * @param {string} password - The password of the user trying to log in.
 */
async function login(username, password) {
    const decryptedPassword = await crypto.clientEncrypt(password);
    const res = await post("/auth/login", {
        username,
        password: decryptedPassword
    });

    if (res.valid) {
        timon.successField("Du bist jetzt eingeloggt.", 1000);
    } else {
        timon.errorField(res.message);
    }
}

/**
 * Asynchronously signs up a user with the provided information.
 * 
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @param {string} name - The name of the user.
 * @param {string} family_name - The family name of the user.
 * @param {Element} picture_element - The element containing the user's picture.
 */
async function signUp(username, password, name, family_name, picture_element) {
    let picture = "";
    try {
        picture = await picture_element.getImgBase64();
    } catch (err) {
        console.info(err.message);
    }

    const decryptedPassword = await crypto.clientEncrypt(password);
    const res = await post("/auth/signUp", {
        username,
        password: decryptedPassword,
        name,
        family_name,
        picture
    });

    if (res.valid) {
        timon.successField("Du hast dich erfolgreich registriert.", 1000);
    } else {
        timon.errorField(res.message);
    }
}

export default {
    login,
    signUp
};

export {
    login,
    signUp
};