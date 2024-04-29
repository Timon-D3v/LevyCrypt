import express from "express";
import path from "path";
import { __dirname } from "../components/constants.js";

const router = express.Router();

// This router serves under /components
router.get("/threejs", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../node_modules/three/build/three.module.min.js"));
});

router.get("/threejs/addons/:folder/:file", (req, res) => {
    res.sendFile(
        path.resolve(__dirname, `../node_modules/three/examples/jsm/${req.params.folder}/${req.params.file}`)
    );
});

router.get("/barba", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../node_modules/@barba/core/dist/barba.umd.js"));
});

router.get("/gsap", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../node_modules/gsap/dist/gsap.js"));
});

router.get("/crypto", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../components/crypto.min.js"));
});

router.get("/timonjs", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../node_modules/timonjs/lib/timon.js"));
});

router.get("/timonjs/module", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../node_modules/timonjs/lib/timon.module.mjs"));
});

export default router;