import express from "express";
import { body, validationResult } from "express-validator";
import { db } from "../config/firebase.js";

const router = express.Router();

// Validation middleware
const validateSubscription = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
];

// Subscribe an email
router.post("/", validateSubscription, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const emailRef = db.collection("subscribers").doc(email);
    const doc = await emailRef.get();

    if (doc.exists) {
      return res.status(400).json({ message: "Email already subscribed" });
    }

    await emailRef.set({
      email,
      subscribedAt: new Date(),
    });

    res.status(201).json({ message: "Thank you for subscribing" });
  } catch (error) {
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Get all subscribed emails
router.get("/", async (req, res) => {
  try {
    const subscribersSnapshot = await db.collection("subscribers").get();
    const subscribers = [];
    subscribersSnapshot.forEach((doc) =>
      subscribers.push({ id: doc.id, ...doc.data() })
    );

    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

// Unsubscribe an email
router.delete("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    await db.collection("subscribers").doc(email).delete();
    res.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

export default router;
