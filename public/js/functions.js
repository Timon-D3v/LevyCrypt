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
    if (!validateEmail(email)) return timon.errorField("Bitte gib eine gültige E-Mail-Adresse ein.");

    const encryptedPassword = await crypto.clientEncrypt(password);

    const res = await post("/auth/login", {
        email,
        password: encryptedPassword,
        publicKey: getKey("client_publicKey")
    });

    if (res.valid) {
        init2Fa();
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
        init2Fa();
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
            innerElement.attribute("src", "/img/placeholder.gif");
            innerElement.data("data-original-name", data.message.name);
            displayImage(data.message, innerElement);
            break;
        case "video":
            innerElement = createElm("video");
            innerElement.attribute("src", data.message.content);
            break;
        case "file":
            innerElement = createElm("a");
            innerElement.attribute("href", data.message.content);
            innerElement.text("Download");
            break;
        case "3d":
            innerElement = createElm("iframe");
            innerElement.attribute("src", data.message.url);
            break;
        default:
            innerElement = createElm("p");
            innerElement.html("<i>Unsupported message type.</i>");
            break;
    }

    innerElement.addClass("inner-message");
    outerElement.append(innerElement);
    getQuery("main").get(0).append(outerElement);
}

async function displayImage(data, element) {
    const res = await fetch(data.url, { method: "GET" });
    const { response } = await res.json();
    const base64 = await crypto.decryptBase64(response.base64.data, response.base64.key, response.base64.iv);
    element.attribute("src", base64);
    element.attribute("alt", data.name);
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
    const recipient = await currentChatPartnerInfo();
    socket.emit("send-message", {
        from: user.email,
        to: recipient.email,
        message: data,
        userPublicKey: getKey("client_publicKey"),
        // If the recipient is offline, I use the sender public key that the backend can encrypt the message and throws no error.
        recipientPublicKey: recipient?.online ? recipient.publicKey : getKey("client_publicKey")
    });
}

async function initChats() {
    const encrypted = getElm("history").text();
    const encryptedKey = getElm("symmetricKey").text();
    const encryptedIv = getElm("iv").text();
    const main = getQuery("main").get(0);

    const keyArray = encryptedKey.split(",").map(Number);
    const ivArray = encryptedIv.split(",").map(Number);

    const key = await crypto.clientDecrypt(keyArray);
    const iv = await crypto.clientDecrypt(ivArray);
    const decrypted = await crypto.cipherDecrypt(encrypted, key, iv);
    const history = JSON.parse(decrypted);

    getElm("history").remove();
    getElm("symmetricKey").remove();
    getElm("iv").remove();

    history.forEach(element => displayChat(element));

    main.scrollTo({
        top: main.scrollHeight,
        behavior: "smooth"
    })
}

function getKey(type) {
    return JSON.parse(window.sessionStorage.getItem(type));
}

async function init2Fa() {
    const res = await post("/auth/2fa/sendCode");

    if (!res.valid) return timon.errorField(res.message);

    const form = createElm("form");
    const title = createElm("h1");
    const input = createElm("input");
    const button = createElm("button");
    const wrapper = getQuery(".auth-wrapper").get(0);

    title.addClass("auth-title", "margin-top-0");
    title.text("2-Faktor-Authentifizierung");
    form.append(title);

    input.id = "auth-code-input";
    input.type = "number";
    input.placeholder = "Code";
    input.addClass("auth-input");
    input.css({
        width: "100%",
    });
    input.min = 100000;
    input.max = 999999;
    form.append(input);

    button.id = "auth-code-button";
    button.type = "button";
    button.text("Verifizieren");
    button.addClass("auth-button");
    button.click(check2FA);
    form.append(button);

    getQuery(".login").hide();
    getQuery(".sign-up").hide();
    wrapper.append(form);
}

async function check2FA() {
    const code = getElm("auth-code-input");
    const email = getElm("email");
    if (code.valIsEmpty() || code.val().length > 6) return timon.errorField("Bitte gib einen gültigen Code ein.");
    const res = await post("/auth/2fa/verifyCode", {
        code: code.val(),
        email: email.valIsEmpty() ? getElm("new-email").val() : email.val()});
    if (res.valid) {
        window.location.href += "chat";
    } else {
        timon.errorField(res.message);
    }
}

function currentChatPartner() {
    return new URLSearchParams(window.location.search).get("email");
}

async function currentChatPartnerInfo() {
    return await getPublicInfo(currentChatPartner());
}

async function sendImage(input) {
    const name = input.file().name;
    const base64 = await input.getImgBase64();
    const data = await crypto.encryptBase64(base64);

    const res = await post("/upload", {
        from: user.email,
        to: currentChatPartner(),
        type: "image",
        name,
        data
    });

    if (!res.valid) return timon.errorField(res.message);

    const outerElement = createElm("div");
    outerElement.addClass("user-message", "outer-message");

    const element = createElm("img");
    element.attribute("src", base64);
    element.attribute("alt", name);
    element.data("data-original-name", name);
    element.addClass("inner-message");

    outerElement.append(element);
    getQuery("main").get(0).append(outerElement);
}

function send3D(input) {
    const name = input.file().name;
    const reader = new FileReader();

    reader.onerror = e => {
        timon.errorField(`File could not be read: ${e.target.error.code}`);
    };

    reader.onload = async e => {
        const base64 = e.target.result;
        const data = await crypto.encryptBase64(base64);
        const res = await post("/upload", {
            from: user.email,
            to: currentChatPartner(),
            type: "3d",
            name,
            data
        });

        if (!res.valid) return timon.errorField(res.message);

        const outerElement = createElm("div");
        outerElement.addClass("user-message", "outer-message");

        const element = createElm("iframe");
        element.attribute("src", res.url);
        element.data("data-original-name", name);
        element.addClass("inner-message");

        outerElement.append(element);
        getQuery("main").get(0).append(outerElement);
    };

    reader.readAsDataURL(input.file());
}

export default {
    validateEmail,
    login,
    signUp,
    displayChat,
    getPublicInfo,
    sendMessage,
    initChats,
    getKey,
    currentChatPartner,
    currentChatPartnerInfo,
    sendImage,
    send3D
};

export {
    validateEmail,
    login,
    signUp,
    displayChat,
    getPublicInfo,
    sendMessage,
    initChats,
    getKey,
    currentChatPartner,
    currentChatPartnerInfo,
    sendImage,
    send3D
};