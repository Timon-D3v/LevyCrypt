import { getElm, errorField } from "timonjs";
import { login, signUp } from "functions";



// Event Listeners
getElm("login-btn").click(() => {
    const email = getElm("email");
    const password = getElm("password");

    if (email.valIsEmpty() || password.valIsEmpty()) {
        errorField("Bitte gib deinen Benutzername und Password ein.");
    } else {
        login(email.val(),password.val());
    }
});

getElm("sign-up-btn").click(() => {
    const new_email = getElm("new-email");
    const new_password = getElm("new-password");
    const given_name = getElm("given-name");
    const family_name = getElm("family-name");

    if (
        new_email.valIsEmpty() ||
        new_password.valIsEmpty() ||
        given_name.valIsEmpty() ||
        family_name.valIsEmpty()
    ) return errorField("Bitte gib alle nötigen Angaben ein, um einen Account zu erstellen.");
    
    signUp(
        new_email.val(),
        new_password.val(),
        given_name.val(),
        family_name.val(),
        getElm("profile-picture")
    );
});

getElm("auth-toggler").click(() => {
    const toggle = id => getElm(id).toggleClass("invisible");

    toggle("login");
    toggle("sign-up");
    toggle("auth-schon");
    toggle("auth-noch");
    toggle("auth-reg");
    toggle("auth-ein");
    toggle("auth-title-log");
    toggle("auth-title-reg");
});

getElm("profile-picture").on("change", async () => {
    const preview = getElm("profile-picture-preview");
    preview.src = await getElm("profile-picture").getImgBase64();
    preview.title = "Dein Profilbild";
    preview.alt = "Dein Profilbild";
});