import gsap from "gsap";

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