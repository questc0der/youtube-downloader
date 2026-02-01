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
  
  // In Docker (Production), we use the system installed 'yt-dlp'
  // Locally, we might fallback to the bin folder
  let ytDlpPath = "yt-dlp"; 
  
  // Check if we are incorrectly trying to use the bin path in production
  const localBinPath = path.join(__dirname, "bin", "yt-dlp");
  
  // If we are strictly ensuring local use, check existence, but for Docker we prefer 'yt-dlp' command
  // We'll trust the command line 'yt-dlp' first if available.
  
  console.log("Using yt-dlp command:", ytDlpPath);

  try {
    // Stream the video directly using yt-dlp
    // Note: We removed the `node:${process.execPath}` runtime arg as the pip version behaves differently
    // and usually manages its own python environment.
    const downloadProcess = spawn(ytDlpPath, [
      "--newline",
      "--no-warnings",
      "-f", "best[ext=mp4]/best",
      "-o", "-",
      videoUrl,
    ]);

    let headersSent = false;

    // Pipe video data to response ONLY after we get data
    downloadProcess.stdout.on('data', (chunk) => {
        if (!headersSent) {
            res.header("Content-Type", "video/mp4");
            res.header("Content-Disposition", `attachment; filename="video.mp4"`);
            headersSent = true;
        }
        res.write(chunk);
    });

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
      if (!headersSent) {
        res.status(500).json({ error: "Failed to start download" });
        headersSent = true;
      }
    });

    // Handle process completion
    downloadProcess.on("close", (code) => {
      if (code !== 0 && !headersSent) {
        console.error(`yt-dlp exited with code ${code}`);
        res.status(500).json({ error: "Download failed" });
        headersSent = true;
      } else {
          res.end();
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
