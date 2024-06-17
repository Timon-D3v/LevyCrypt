import timon, { post, getElm, getQuery, createElm } from "timonjs";
import socket from "./io.js";
import  crypto from "./crypto.js";
import user from "user";

/**
 * Validates an email address using a regular expression.
 * 
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email address is valid, false otherwise.
 */
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

/**
 * Asynchronous function to log in a user with the provided email and password.
 * 
 * @param {string} email - The email of the user trying to log in.
 * @param {string} password - The password of the user trying to log in.
 */
async function login(email, password) {
    if (!validateEmail(email)) {
        timon.errorField("Bitte gib eine gültige E-Mail-Adresse ein.");
        return;
    }

    const encryptedPassword = await crypto.clientEncrypt(password);

    const res = await post("/auth/login", {
        email,
        password: encryptedPassword,
        publicKey: getKey("client_publicKey")
    });

    if (res.valid) {
        window.location.href += "chat";
        timon.successField("Du bist jetzt eingeloggt.", 1000);
    } else {
        timon.errorField(res.message);
    }
}

/**
 * Asynchronously signs up a user with the provided information.
 * 
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @param {string} name - The name of the user.
 * @param {string} family_name - The family name of the user.
 * @param {Element} picture_element - The element containing the user's picture.
 */
async function signUp(email, password, name, family_name, picture_element) {
    if (!validateEmail(email)) {
        timon.errorField("Bitte gib eine gültige E-Mail-Adresse ein.");
        return;
    }
    
    let picture = "";
    try {
        picture = await picture_element.getImgBase64();
    } catch (err) {
        console.info(err.message);
    }

    const encryptedPassword = await crypto.clientEncrypt(password);
    const res = await post("/auth/signUp", {
        email,
        password: encryptedPassword,
        name,
        family_name,
        picture,
        publicKey: window.sessionStorage.getItem("client_publicKey")
    });

    if (res.valid) {
        window.location.href += "chat";
        timon.successField("Du hast dich erfolgreich registriert.", 1000);
    } else {
        timon.errorField(res.message);
    }
}

/**
 * Displays a chat message in the chat window.
 * 
 * @param {Object} data - The chat message data.
 */
function displayChat(data) {

    const outerElement = createElm("div");
    outerElement.addClass(data.from === user.email ? "user-message" : "contact-message", "outer-message");
    let innerElement;

    switch (data.message.type) {
        case "text":
            innerElement = createElm("p");
            innerElement.text(data.message.content);
            break;
        case "image":
            innerElement = createElm("img");
            innerElement.attr("src", data.message.content);
            break;
        case "video":
            innerElement = createElm("video");
            innerElement.attr("src", data.message.content);
            break;
        case "file":
            innerElement = createElm("a");
            innerElement.attr("href", data.message.content);
            innerElement.text("Download");
            break;
        case "3d":
            innerElement = createElm("iframe");
            innerElement.attr("src", data.message.content);
            break;
        default:
            innerElement = createElm("p");
            innerElement.text("<i>Unsupported message type.</i>");
            break;
    }

    innerElement.addClass("inner-message");
    outerElement.append(innerElement);
    getQuery("main").get(0).append(outerElement);
}

/**
 * Retrieves public information for a given email address.
 *
 * @param {string} email - The email address to retrieve public information for.
 * @returns {Promise} - A promise that resolves with the public information.
 */
async function getPublicInfo(email) {
    return await post("/security/get-public-info", {email});
}

/**
 * Sends a message using the socket.
 * 
 * @param {any} data - The message data to send.
 * @returns {Promise<void>} - A promise that resolves when the message is sent.
 */
async function sendMessage(data) {
    socket.emit("send-message", {
        from: user.email,
        to: new URLSearchParams(window.location.search).get("email"),
        message: data
    });
}

async function initChats() {
    const encrypted = getElm("history").text();
    const encryptedKey = getElm("symmetricKey").text();
    const encryptedIv = getElm("iv").text();

    const keyArray = encryptedKey.split(",").map(Number);
    const ivArray = encryptedIv.split(",").map(Number);

    const key = await crypto.clientDecrypt(keyArray);
    const iv = await crypto.clientDecrypt(ivArray);

    console.log(key);

    console.log(iv);

    console.log("Hello world")
    /*const decrypted = crypto.cipherDecrypt(encrypted, key, iv);
    const history = JSON.parse(decrypted);

    console.log(history);

    getElm("history").remove();
    getElm("symmetricKey").remove();
    getElm("iv").remove();*/
}

function getKey(type) {
    return JSON.parse(window.sessionStorage.getItem(type));
}

export default {
    validateEmail,
    login,
    signUp,
    displayChat,
    getPublicInfo,
    sendMessage,
    initChats,
    getKey
};

export {
    validateEmail,
    login,
    signUp,
    displayChat,
    getPublicInfo,
    sendMessage,
    initChats,
    getKey
};