import barba from "@barba/core";
import { initChats } from "./functions.js";
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
            // This function is not called yet: Look out
            console.log("Hey")
            initChats();
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