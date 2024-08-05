import { getElm } from "timonjs";
import { login, signUp } from "./functions.js";



const email = getElm("email"),
    password = getElm("password"),
    new_email = getElm("new-email"),
    new_password = getElm("new-password"),
    given_name = getElm("given-name"),
    family_name = getElm("family-name"),
    picture = getElm("profile-picture");



// Event Listeners
getElm("login-btn").click(() => {
    if (email.valIsEmpty() || password.valIsEmpty()) {
        timon.errorField("Bitte gib deinen Benutzername und Password ein.");
    } else {
        login(email.val(),password.val());
    }
});


getElm("sign-up-btn").click(() => {
    if (
        new_email.valIsEmpty() ||
        new_password.valIsEmpty() ||
        given_name.valIsEmpty() ||
        family_name.valIsEmpty()
    ) return timon.errorField("Bitte gib alle nötigen Angaben ein, um einen Account zu erstellen.");
    
    signUp(
        new_email.val(),
        new_password.val(),
        given_name.val(),
        family_name.val(),
        picture
    );
});