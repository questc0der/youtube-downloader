const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/download", async (req, res) => {
  console.log("Download request received:", req.body);
  const videoUrl = req.body.url;

  if (!videoUrl) {
    console.log("No URL provided");
    return res.status(400).send("Please provide a YouTube URL");
  }

  console.log("Processing download for URL:", videoUrl);
  const ytDlpPath = path.join(__dirname, "bin", "yt-dlp");
  const nodePath = process.execPath;

  try {
    // Set headers for download (generic filename for now, yt-dlp will handle it)
    res.header("Content-Type", "video/mp4");
    res.header("Content-Disposition", `attachment; filename="video.mp4"`);

    // Stream the video directly using yt-dlp
    // yt-dlp will output to stdout and we pipe it to the response
    const downloadProcess = spawn(ytDlpPath, [
      "--newline",  // Progress on new lines
      "--no-warnings",  // Reduce stderr noise
      "-f", "best[ext=mp4]/best",  // Best quality mp4
      "-o", "-",  // Output to stdout
      "--js-runtimes", `node:${nodePath}`,
      videoUrl,
    ]);

    // Pipe video data to response
    downloadProcess.stdout.pipe(res);

    // Log any errors from stderr (but don't send to client)
    downloadProcess.stderr.on("data", (data) => {
      const errorMsg = data.toString();
      // Only log actual errors, not progress info
      if (errorMsg.includes("ERROR")) {
        console.error("yt-dlp error:", errorMsg);
      }
    });

    // Handle process errors
    downloadProcess.on("error", (error) => {
      console.error("Failed to spawn yt-dlp:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to start download" });
      }
    });

    // Handle process completion
    downloadProcess.on("close", (code) => {
      if (code !== 0 && !res.headersSent) {
        console.error(`yt-dlp exited with code ${code}`);
        res.status(500).json({ error: "Download failed" });
      }
    });

    // Handle client disconnect
    res.on("close", () => {
      if (!downloadProcess.killed) {
        downloadProcess.kill();
      }
    });

  } catch (error) {
    console.error("Download error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error processing download" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
