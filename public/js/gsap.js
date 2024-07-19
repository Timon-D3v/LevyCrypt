import gsap from "gsap";

/**
 * Animates the page transition by sliding it out from the top.
 */
function pageOut() {
    gsap.set("#transition", {
        translateY: "-100%",
        backgroundColor: "white"
    });
    gsap.to("#transition", {
        duration: 0.5,
        translateY: 0,
        ease: "power2.inOut"
    });
}

/**
 * Animates the page transition by sliding it in from the bottom.
 */
function pageIn() {
    gsap.set("#transition", {
        translateY: 0,
        backgroundColor: "white"
    });
    gsap.to("#transition", {
        duration: 0.5,
        translateY: "100%",
        ease: "power2.inOut"
    });
}

export default {
    pageOut,
    pageIn
}

export {
    pageOut,
    pageIn
}