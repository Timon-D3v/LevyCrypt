import crypto from "./crypto.js";
import functions from "./functions.js";
import timon, { post, getElm, getQuery } from "timonjs";



// Constants
const { publicKey } = await post("/security/get-public-key"),
    keys = await crypto.generateRSAKeyPair(),
    username = getElm("username"),
    password = getElm("password"),
    new_username = getElm("new-username"),
    new_password = getElm("new-password"),
    given_name = getElm("given-name"),
    family_name = getElm("family-name"),
    picture_label = getElm("profile-picture-label"),
    picture = getElm("profile-picture");




// Event Listeners
getElm("login-btn").click(() => {
    if (username.valIsEmpty() || password.valIsEmpty()) {
        timon.errorField("Bitte gib deinen Benutzername und Password ein.");
    } else {
        functions.login(username.val(),password.val());
    }
});


getElm("sign-up-btn").click(() => {
    if (
        new_username.valIsEmpty() ||
        new_password.valIsEmpty() ||
        given_name.valIsEmpty() ||
        family_name.valIsEmpty()
    ) {
        timon.errorField("Bitte gib alle nötigen Angaben ein, um einen Account zu erstellen.");
    } else {
        functions.signUp(
            new_username.val(),
            new_password.val(),
            given_name.val(),
            family_name.val(),
            picture
        );
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