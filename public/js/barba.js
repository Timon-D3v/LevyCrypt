import barba from "@barba/core";
import { getElm } from "timonjs";
import crypto from "./crypto.js";
import * as animations from "./gsap.js";

barba.init({
    schema: {
        prefix: "data-barba-type",
        wrapper: "wrapper",
        container: "chat-container",
    },
    views: [{
        namespace: "chat",
        beforeEnter() {
            // update the menu based on user navigation
            menu.update();
        },
        afterEnter() {
            const encrypted = getElm("history").text();
            const encryptedKey = getElm("symmetricKey").text();
            const encryptedIv = getElm("iv").text();

            const key = crypto.decryptMessage(encryptedKey);
            const iv = crypto.decryptMessage(encryptedIv);

            const decrypted = crypto.cipherDecrypt(encrypted, key, iv);
            const history = JSON.parse(decrypted);

            console.log(history);

            getElm("history").remove();
            getElm("symmetricKey").remove();
            getElm("iv").remove();
        }
    }],
    transitions: [{
        name: "default-transition",
        leave(data) {
            // create your stunning leave animation here
            animations.pageOut();
            setTimeout(animations.pageIn, 500);
        },
        enter(data) {
            // create your amazing enter animation here
        }
    }]
});