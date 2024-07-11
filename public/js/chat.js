import { getElm } from "timonjs";
import functions from "./functions.js";

// Initialize Chats
if (window.location.pathname === "/chat") functions.initChats();



const settings = {
    type: "text"
};

getElm("send").click(() => {

    const input = getElm("main-input");

    if (input.valIsEmpty()) return;

    functions.sendMessage({
        type: settings.type,
        content: input.val()
    });

    input.val("");
});