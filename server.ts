import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending email
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, body, formData } = req.body;

    const RECIPIENT_EMAIL = "bohrer.archviz@gmail.com";

    console.log("Received email request:", { to: RECIPIENT_EMAIL, subject });
    
    // To send real emails via Gmail, you would need:
    // 1. A Gmail account
    // 2. An "App Password" (generated in Google Account settings)
    // 3. Configure the transporter below:

    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bohrer.archviz@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // Set this in your environment variables
      },
    });
    */
    
    try {
      // If we had credentials, we would do:
      // await transporter.sendMail({ from: '"BOHRER Archviz" <bohrer.archviz@gmail.com>', to: RECIPIENT_EMAIL, subject, text: body });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      res.json({ 
        success: true, 
        message: "Email request received and logged on server.",
        simulated: true 
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
