import timon, { post, getElm, getQuery, createElm } from "timonjs";
import socket from "./io.js";
import crypto from "crypto";
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

    getQuery(".auth-button").forEach(button => button.disabled = true);

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

    getQuery(".auth-button").forEach(button => button.disabled = true);
    
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
        publicKey: getKey("client_publicKey")
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
    
    const main = getQuery("main").get(0);
    main.append(outerElement);

    main.scrollTo({
        top: main.scrollHeight,
        behavior: "smooth"
    });
}

/**
 * Displays an image on the specified element.
 * @param {Object} data - The image data.
 * @param {string} data.url - The URL of the image.
 * @param {string} data.name - The name of the image.
 * @param {HTMLElement} element - The element to display the image on.
 * @returns {Promise<void>} - A promise that resolves when the image is displayed.
 */
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
        recipientPublicKey: recipient.online ? recipient.publicKey : getKey("client_publicKey")
    });
}

/**
 * Initializes the chats by decrypting the chat history and displaying it on the page.
 * 
 * @returns {Promise<void>} A promise that resolves when the chat history is initialized.
 */
async function initChats() {
    const element = getElm("history");
    const keyElement = getElm("symmetricKey");
    const ivElement = getElm("iv");

    const encrypted = element.text();
    const encryptedKey = keyElement.text();
    const encryptedIv = ivElement.text();
    const main = getQuery("main").get(0);

    const keyArray = encryptedKey.split(",").map(Number);
    const ivArray = encryptedIv.split(",").map(Number);

    const key = await crypto.clientDecrypt(keyArray);
    const iv = await crypto.clientDecrypt(ivArray);
    const decrypted = await crypto.cipherDecrypt(encrypted, key, iv);
    const history = JSON.parse(decrypted);

    element.remove();
    keyElement.remove();
    ivElement.remove();

    history.forEach(element => displayChat(element));

    main.scrollTo({
        top: main.scrollHeight,
        behavior: "smooth"
    });
}

/**
 * Retrieves the value associated with the given key from the session storage.
 * @param {string} type - The key to retrieve the value for.
 * @returns {*} - The value associated with the given key, or null if the key does not exist.
 */
function getKey(type) {
    return JSON.parse(window.sessionStorage.getItem(type));
}

/**
 * Initializes the 2-Faktor-Authentifizierung (2FA) process.
 * Sends a verification code to the user and creates the necessary form elements for code input and verification.
 * Hides the login and sign-up sections and appends the form to the authentication wrapper.
 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
 */
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

/**
 * Checks the 2FA code entered by the user and performs the necessary actions based on the result.
 * @returns {Promise<void>} A promise that resolves when the code is verified.
 */
async function check2FA() {
    const code = getElm("auth-code-input");
    const email = getElm("email");
    if (code.valIsEmpty() || code.val().length > 6) return timon.errorField("Bitte gib einen gültigen Code ein.");
    const res = await post("/auth/2fa/verifyCode", {
        code: code.val(),
        email: email.valIsEmpty() ? getElm("new-email").val() : email.val()});
    if (!res.valid) return timon.errorField(res.message);

    socket.emit("verification", {
        email: email.valIsEmpty() ? getElm("new-email").val() : email.val(),
        publicKey: getKey("client_publicKey")
    });
    window.location.href += "chat";
}

/**
 * Retrieves the current chat partner's email from the URL parameters.
 * @returns {string|null} The email of the current chat partner, or null if not found.
 */
function currentChatPartner() {
    return new URLSearchParams(window.location.search).get("email");
}

/**
 * Retrieves the public information of the current chat partner.
 * @returns {Promise<Object>} A promise that resolves to the public information of the current chat partner.
 */
async function currentChatPartnerInfo() {
    return await getPublicInfo(currentChatPartner());
}

/**
 * Sends an image to the server for uploading and displays it in the chat window.
 * @param {Input} input - The input object containing the image file.
 * @returns {Promise<void>} - A promise that resolves when the image is sent and displayed successfully.
 */
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

    getElm("file-menu").toggleClass("invisible");
}

/**
 * Sends a 3D file to the server for uploading and displays it in the chat window.
 * @param {File} input - The input file to be sent.
 */
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

        getElm("file-menu").toggleClass("invisible");
    };

    reader.readAsDataURL(input.file());
}

/**
 * Handles the send button click event.
 * Sends a text message to the server after encrypting the input value.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 */
async function sendHandler() {
    const input = getElm("main-input");

    if (input.valIsEmpty()) return;

    sendMessage({
        type: "text",
        content: await crypto.encryptLongText(input.val())
    });

    input.val("");
}

/**
 * Initializes the navigation by retrieving encrypted messages and decrypting them.
 * @returns {Promise<void>} A promise that resolves when the navigation is initialized.
 */
async function initNav() {
    const { encrypted } = await post("/security/get-nav-messages");

    const decrypted = await crypto.decryptLongText(encrypted.data, encrypted.key, encrypted.iv);

    const data = JSON.parse(decrypted);

    getElm("nav").html("");

    data.forEach(message => {
        displayNavMessage(message);
    });
}

/**
 * Displays a navigation message based on the provided data.
 * 
 * @param {Object} data - The data object containing the message details.
 * @returns {Promise<void>} - A promise that resolves once the navigation message is displayed.
 */
async function displayNavMessage(data) {
    const outerElement = createElm("a");
    outerElement.addClass("nav-element");

    const isFromUser = data.from === user.email;
    const contact = await getPublicInfo(isFromUser ? data.to : data.from);

    outerElement.attribute("href", `/chat?email=${contact.email}`);

    const innerElement = createElm("p");
    innerElement.addClass("nav-message");

    const messageStart = isFromUser ? "You: " : `${contact.name}: `;

    switch (data.message.type) {
        case "text":
            innerElement.html(messageStart + data.message.content);
            break;
        case "image":
            innerElement.html(`${messageStart}Bild (${data.message.name})`);
            break;
        case "video":
            innerElement.html(`${messageStart}Video (${data.message.name})`);
            break;
        case "file":
            innerElement.html(`${messageStart}Datei (${data.message.name})`);
            break;
        case "3d":
            innerElement.html(`${messageStart}3D-Modell`);
            break;
        default:
            innerElement.html("<i>Unsupported message type.</i>");
            break;
    }

    const img = createElm("img");
    img.addClass("nav-picture");
    img.attribute("src", contact.picture);
    img.attribute("alt", contact.name + "'s Profilbild");
    img.attribute("title", contact.name + " " + contact.family_name);

    const h3 = createElm("h3");
    h3.addClass("nav-name");
    h3.text(contact.name + " " + contact.family_name);

    const div = createElm("div");
    div.addClass("nav-info");

    div.append(h3, innerElement);
    outerElement.append(img, div);
    
    getElm("nav").append(outerElement);
}

/**
 * Initializes a new chat window and is called by barba.js when the chat namespace is entered.
 * 
 * @returns {Promise<void>} A promise that resolves when the chat namespace is initialized.
 */
async function namespaceChat() {
    const { email, name, family_name, picture } = await currentChatPartnerInfo();
    const img = getElm("contact-profile-picture");

    getElm("contact-name").text(`${name} ${family_name}`);
    getElm("profile-picture").attribute("href", `/chat?email=${email}`);
    img.attribute("src", picture);
    img.attribute("alt", `${name}'s Profilbild`);
    img.attribute("title", `${name} ${family_name}`);

    closeMobileOptions();
    initChats();
    initNav();

    socket.emit("join-room", email);

    getElm("send").click(sendHandler);

    getElm("show-file-menu").click(() => {
        getElm("file-menu").toggleClass("invisible");
    });
}

/**
 * Updates the navigation.
 */
function updateNav() {
    initNav();
}

/**
 * Updates the search results based on the input value.
 * 
 * @returns {Promise<void>} A promise that resolves when the search results are updated.
 */
async function updateSearch() {
    const input = getElm("search");

    if (input.valIsEmpty() || input.val().trim() === "") return;

    const { data } = await post("/security/get-users-where", {input: input.val().trim()});

    getElm("search-results").html("");

    data.forEach(element => displaySearchResult(element));
}

/**
 * Displays a search result element in the navigation.
 * 
 * @param {Object} element - The search result element.
 * @param {string} element.email - The email of the element.
 * @param {string} element.picture - The picture URL of the element.
 * @param {string} element.name - The name of the element.
 * @param {string} element.family_name - The family name of the element.
 */
function displaySearchResult(element) {
    const outerElement = createElm("a");
    outerElement.addClass("nav-element");

    outerElement.attribute("href", `/chat?email=${element.email}`);

    const innerElement = createElm("p");
    innerElement.addClass("nav-message");
    innerElement.html(element.email);

    const img = createElm("img");
    img.addClass("nav-picture");
    img.attribute("src", element.picture);
    img.attribute("alt", element.name + "'s Profilbild");
    img.attribute("title", element.name + " " + element.family_name);

    const h3 = createElm("h3");
    h3.addClass("nav-name");
    h3.text(element.name + " " + element.family_name);

    const div = createElm("div");
    div.addClass("nav-info");

    div.append(h3, innerElement);
    outerElement.append(img, div);

    getElm("search-results").append(outerElement);
}

/**
 * Closes the mobile options.
 */
function closeMobileOptions() {
    if (window.innerWidth > 1000) return;

    try {
        getElm("mobile___options-wrapper").remove();
    } catch (e) {
        console.error("No mobile options wrapper found.");
    } finally {
        getElm("nav").removeClass("mobile___nav-active");
        getElm("search-results").removeClass("mobile___search-results");
        getQuery(".search").get(0).removeClass("mobile___search-container");
    }
}

/**
 * Opens the mobile search options.
 */
function openMobileSearchOptions() {

    const div = createElm("div");
    const logo = createElm("img");
    const title = createElm("h1");
    const close = createElm("img");
    const results = getElm("search-results");
    const bar = getQuery(".search").get(0);
    
    logo.addClass("mobile___search-logo");
    logo.src = "/img/logo.svg";
    logo.alt = "Logo";
    logo.title = "LevyCrypt";
    logo.css({
        filter: "none"
    });

    title.addClass("mobile___search-title");
    title.text("Suchen");

    close.addClass("mobile___search-close");
    close.src = "/img/svg/close.svg";
    close.alt = "Schliessen";
    close.title = "Schliessen";
    close.css({
        cursor: "pointer"
    });
    close.click(closeMobileOptions);

    div.addClass("mobile___search");
    div.id = "mobile___options-wrapper";
    div.append(logo, title, close);

    results.addClass("mobile___search-results");

    bar.addClass("mobile___search-container");

    getQuery("body").get(0).append(div);
}

/**
 * Opens the mobile navigation options.
 */
function openMobileNavOptions() {

    const div = createElm("div");
    const logo = createElm("img");
    const title = createElm("h1");
    const close = createElm("img");
    const nav = getElm("nav");

    logo.addClass("mobile___chats-logo");
    logo.src = "/img/logo.svg";
    logo.alt = "Logo";
    logo.title = "LevyCrypt";
    logo.css({
        filter: "none"
    });

    title.addClass("mobile___chats-title");
    title.text("Chats");

    close.addClass("mobile___chats-close");
    close.src = "/img/svg/close.svg";
    close.alt = "Schliessen";
    close.title = "Schliessen";
    close.css({
        cursor: "pointer"
    });
    close.click(closeMobileOptions);

    div.addClass("mobile___chats");
    div.id = "mobile___options-wrapper";
    div.append(logo, title, close);

    nav.addClass("mobile___nav-active");

    getQuery("body").get(0).append(div);
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
    send3D,
    sendHandler,
    initNav,
    displayNavMessage,
    namespaceChat,
    updateNav,
    updateSearch,
    displaySearchResult,
    closeMobileOptions,
    openMobileSearchOptions,
    openMobileNavOptions
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
    send3D,
    sendHandler,
    initNav,
    displayNavMessage,
    namespaceChat,
    updateNav,
    updateSearch,
    displaySearchResult,
    closeMobileOptions,
    openMobileSearchOptions,
    openMobileNavOptions
};