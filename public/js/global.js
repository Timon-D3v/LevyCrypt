import crypto from "./crypto.js";
import functions from "./functions.js";
import timon, { post, getElm, getQuery } from "timonjs";



// Constants
const { publicKey } = await post("/security/get-public-key");
const keys = await crypto.generateRSAKeyPair();
const username = getElm("username");
const password = getElm("password");




// Event Listeners
getElm("login-btn").click(() => {
    if (username.valIsEmpty(), password.valIsEmpty()) {
        timon.errorField("Bitte gib deinen Benutzername und Password ein.");
    } else {
        functions.login(username.val(),password.val());
    }
});



export default {
    publicKey,
    keys
};

export {
    publicKey,
    keys
};