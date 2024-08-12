import barba from "@barba/core";
import socket from "./io.js";
import { namespaceChat, initNav, currentChatPartner } from "functions";
import * as animations from "./gsap.js";
import { getQuery } from "timonjs";

barba.init({
    debug: false,
    schema: {
        wrapper: "wrapper",
        container: "chat-container",
    },
    views: [{
        namespace: "chat",
        beforeLeave() {
            socket.emit("leave-room", currentChatPartner());
        },
        afterEnter() {
            namespaceChat();
        }
    }, {
        namespace: "empty-chat",
        afterEnter() {
            getQuery("main").get(0).html("");
            initNav();
        }
    }],
    transitions: [{
        name: "default-transition",
        leave() {
            animations.pageOut();
            setTimeout(animations.pageIn, 1000);
        }
    }]
});