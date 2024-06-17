import crypto from "./crypto.js";
import functions from "./functions.js";
import user from "user";
import timon, { post, getElm, getQuery } from "timonjs";



// Constants
const { publicKey } = await post("/security/get-public-key"),

    keys = functions.getKey("client_publicKey") === null ?
    await crypto.generateRSAKeyPair() :
    {
        publicKey: functions.getKey("client_publicKey"),
        privateKey: functions.getKey("client_privateKey")
    },
    email = getElm("email"),
    password = getElm("password"),
    new_email = getElm("new-email"),
    new_password = getElm("new-password"),
    given_name = getElm("given-name"),
    family_name = getElm("family-name"),
    picture_label = getElm("profile-picture-label"),
    picture = getElm("profile-picture");



// Initialize
window.sessionStorage.setItem("server_publicKey", JSON.stringify(publicKey));
window.sessionStorage.setItem("client_publicKey", JSON.stringify(keys.publicKey));
window.sessionStorage.setItem("client_privateKey", JSON.stringify(keys.privateKey));

// Event Listeners
getElm("login-btn").click(() => {
    if (email.valIsEmpty() || password.valIsEmpty()) {
        timon.errorField("Bitte gib deinen Benutzername und Password ein.");
    } else {
        functions.login(email.val(),password.val());
    }
});


getElm("sign-up-btn").click(() => {
    if (
        new_email.valIsEmpty() ||
        new_password.valIsEmpty() ||
        given_name.valIsEmpty() ||
        family_name.valIsEmpty()
    ) {
        timon.errorField("Bitte gib alle nötigen Angaben ein, um einen Account zu erstellen.");
    } else {
        functions.signUp(
            new_email.val(),
            new_password.val(),
            given_name.val(),
            family_name.val(),
            picture
        );
    }
});