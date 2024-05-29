import express from "express";
import { keys } from "../app.js";

const router = express.Router();

// This router serves under /security
router.post("/get-public-key", (req, res) => {
    res.json({publicKey: keys.publicKey});
});

export default router;