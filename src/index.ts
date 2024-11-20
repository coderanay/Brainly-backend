import express from "express";
import mongoose from "mongoose";
import { ContentModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";

const app = express();
app.use(express.json());

// POST /api/v1/signup
//@ts-ignore
app.post("/api/v1/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create a new user
    await UserModel.create({ username, password });
    res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error signing up user", error });
  }
});

// POST /api/v1/signin
app.post("/api/v1/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await UserModel.findOne({ username, password });
    if (existingUser) {
      const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);
      res.json({ token });
    } else {
      res.status(403).json({ message: "Incorrect credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error signing in", error });
  }
});

// POST /api/v1/content
app.post("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const { link, type } = req.body;

    await ContentModel.create({
      link,
      type,
      title: req.body.title,
//@ts-ignore,   
      userId: req.userId,
      tags: [],
    });

    res.status(201).json({ message: "Content added" });
  } catch (error) {
    res.status(500).json({ message: "Error adding content", error });
  }
});

// GET /api/v1/content
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const content = await ContentModel.find({ userId: req.userId }).populate("userId", "username");

    res.json({ content });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving content", error });
  }
});

// DELETE /api/v1/content
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const { contentId } = req.body;

    await ContentModel.deleteMany({
      _id: contentId,
      //@ts-ignore
      userId: req.userId,
    });

    res.json({ message: "Content deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting content", error });
  }
});

// POST /api/v1/brain/share
//@ts-ignore
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  try {
    const { contentId } = req.body;

    const content = await ContentModel.findOne({
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
  } catch (error) {
    res.status(500).json({ message: "Error generating share link", error });
  }
});

// GET /api/v1/brain/:shareLink
//@ts-ignore
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    try {
      const { shareLink } = req.params;
  
      // Example parsing logic (you can customize how the shareLink is structured)
      const contentId = shareLink.split("-")[1];
  
      const content = await ContentModel.findOne({ _id: contentId }).populate("userId", "username");
  
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
  
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving shared content", error });
    }
  });
  
  // Start the server
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });


//.d.ts