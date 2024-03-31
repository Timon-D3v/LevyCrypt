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
        path.resolve(__dirname, `../node_modules/three/examples/jsm/${req.params.folder}/${req.params.file}.js`)
    );
});

export default router;