import express from "express";

const router = express.Router();

// This router serves under /
router.get("/", (req, res) => {
    res.render("index.ejs");
});

export default router;