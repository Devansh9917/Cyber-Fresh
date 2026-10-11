import express from "express";
import { sendEmail } from "../utils/email.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.post("/test-email", protect, restrictTo("admin"), async (req, res) => {
    if (process.env.NODE_ENV === "production") {
        return res.status(404).json({ message: "Route not found" });
    }

    try {
        const result = await sendEmail({
            to: req.user.email,
            subject: "CyberFresh Test Email",
            text: "This is a test email from CyberFresh.",
        });

        if (!result.sent) {
            return res.status(503).json({ success: false, message: result.message });
        }

        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;