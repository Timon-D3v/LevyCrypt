import { getElm, on } from "timonjs";
import {
	sendHandler,
	sendImage,
	send3D,
	openMobileNavOptions,
	openMobileSearchOptions,
	updateSearch,
} from "functions";



// Event Listeners
on(document, "keydown", e => {
    const input = getElm("main-input");
    const element = document.activeElement;
    if (e.key === "Enter" && input === element) sendHandler();
});

getElm("mobile___show-file-menu").click(() => getElm("file-menu").toggleClass("invisible"));
getElm("close-file-menu").click(() => getElm("file-menu").toggleClass("invisible"));

getElm("send-image").click(e => {
    e.preventDefault();
    sendImage(getElm("image-file"));
});

getElm("send-3d").click(e => {
    e.preventDefault();
    send3D(getElm("3d-file"));
});

getElm("search").on("input", updateSearch);

getElm("mobile___chats").click(openMobileNavOptions);
getElm("mobile___search").click(openMobileSearchOptions);

/**
 * Stops the event propagation.
 * 
 * @param {Event} e - The event object.
 */
const stop = e => e.stopPropagation();

getElm("fallback___label-image-file").click(stop);
getElm("fallback___3d-file").click(stop);
getElm("image-file").click(stop);
getElm("3d-file").click(stop);