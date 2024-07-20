import barba from "@barba/core";
import socket from "./io.js";
import { initChats, currentChatPartnerInfo, currentChatPartner } from "./functions.js";
import * as animations from "./gsap.js";
import { getElm, getQuery } from "timonjs";

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
        async afterEnter() {
            const { email, name, family_name, picture } = await currentChatPartnerInfo();
            const img = getElm("contact-profile-picture");

            getElm("contact-name").text(`${name} ${family_name}`);
            getElm("profile-picture").attribute("href", `/chat?email=${email}`);
            img.attribute("src", picture);
            img.attribute("alt", `${name}'s Profilbild`);
            img.attribute("title", `${name} ${family_name}`);

            initChats();

            socket.emit("join-room", email);
        }
    }, {
        namespace: "empty-chat",
        afterEnter() {
            getQuery("main").get(0).html("");
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