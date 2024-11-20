"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// POST /api/v1/signup
//@ts-ignore
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Check if user already exists
        const existingUser = yield db_1.UserModel.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        // Create a new user
        yield db_1.UserModel.create({ username, password });
        res.status(201).json({ message: "User signed up successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error signing up user", error });
    }
}));
// POST /api/v1/signin
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const existingUser = yield db_1.UserModel.findOne({ username, password });
        if (existingUser) {
            const token = jsonwebtoken_1.default.sign({ id: existingUser._id }, config_1.JWT_PASSWORD);
            res.json({ token });
        }
        else {
            res.status(403).json({ message: "Incorrect credentials" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error signing in", error });
    }
}));
// POST /api/v1/content
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { link, type } = req.body;
        yield db_1.ContentModel.create({
            link,
            type,
            title: req.body.title,
            //@ts-ignore,   
            userId: req.userId,
            tags: [],
        });
        res.status(201).json({ message: "Content added" });
    }
    catch (error) {
        res.status(500).json({ message: "Error adding content", error });
    }
}));
// GET /api/v1/content
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const content = yield db_1.ContentModel.find({ userId: req.userId }).populate("userId", "username");
        res.json({ content });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving content", error });
    }
}));
// DELETE /api/v1/content
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentId } = req.body;
        yield db_1.ContentModel.deleteMany({
            _id: contentId,
            //@ts-ignore
            userId: req.userId,
        });
        res.json({ message: "Content deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting content", error });
    }
}));
// POST /api/v1/brain/share
//@ts-ignore
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentId } = req.body;
        const content = yield db_1.ContentModel.findOne({
            _id: contentId,
            //@ts-ignore
            userId: req.userId,
        });
        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }
        // Generate a unique share link (e.g., using UUID)
        const shareLink = `share-${contentId}-${Date.now()}`;
        res.json({ message: "Share link generated", shareLink });
    }
    catch (error) {
        res.status(500).json({ message: "Error generating share link", error });
    }
}));
// GET /api/v1/brain/:shareLink
//@ts-ignore
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shareLink } = req.params;
        // Example parsing logic (you can customize how the shareLink is structured)
        const contentId = shareLink.split("-")[1];
        const content = yield db_1.ContentModel.findOne({ _id: contentId }).populate("userId", "username");
        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }
        res.json({ content });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving shared content", error });
    }
}));
// Start the server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
//.d.ts
