import { getElm } from "timonjs";
import crypto from "crypto";
import functions from "./functions.js";

// Initialize Chats
if (window.location.pathname === "/chat") functions.initChats();



const settings = {
    type: "text"
};

getElm("send").click(async () => {

    const input = getElm("main-input");

    if (input.valIsEmpty()) return;

    functions.sendMessage({
        type: settings.type,
        content: await crypto.encryptLongText(input.val())
    });

    input.val("");
});