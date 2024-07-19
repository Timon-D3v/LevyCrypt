import { getElm, on } from "timonjs";
import { sendHandler, initChats } from "./functions.js";

// Initialize Chats
if (window.location.pathname === "/chat") initChats();



// Event Listeners
getElm("send").click(sendHandler);
on(document, "keydown", e => {
    const input = getElm("main-input");
    const element = document.activeElement;
    if (e.key === "Enter" && input === element) sendHandler();
});

getElm("show-file-menu").click(() => {
    getElm("file-menu").toggleClass("invisible");
});

getElm("close-file-menu").click(() => {
    getElm("file-menu").toggleClass("invisible");
});