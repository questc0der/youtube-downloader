const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

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

app.post("/info", async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: "No URL provided" });

  console.log("Fetching info for:", videoUrl);
  
  const cookiesPath = path.join(__dirname, "cookies.txt");
  const args = [
    "--dump-json",
    "--no-warnings",
    "--no-cache-dir",
    "--force-ipv4",
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "--add-header", "Accept-Language: en-US,en;q=0.9",
    "--extractor-args", "youtube:player_client=android,mweb",
    videoUrl
  ];

  if (fs.existsSync(cookiesPath)) {
      args.push("--cookies", cookiesPath);
  }

  const process = spawn("yt-dlp", args);
  
  let output = "";
  let errorOutput = "";

  process.stdout.on("data", (data) => output += data.toString());
  process.stderr.on("data", (data) => errorOutput += data.toString());

  process.on("close", (code) => {
    if (code !== 0) {
      console.error("Info fetch failed:", errorOutput);
      return res.status(500).json({ error: "Failed to fetch video info", details: errorOutput });
    }
    
    try {
      const info = JSON.parse(output);
      // Filter formats: we want files that have both video and audio, or "best" specific ones
      // This is a simple filter; you might want to refine it securely.
      const formats = info.formats
        .filter(f => f.ext === 'mp4' && f.vcodec !== 'none' && f.acodec !== 'none')
        .map(f => ({
            format_id: f.format_id,
            resolution: f.resolution || 'unknown',
            ext: f.ext,
            note: f.format_note
        }));
        
        // Add a generic "Best Quality" option at the top
        formats.unshift({ format_id: "best", resolution: "Best Available", ext: "mp4", note: "Auto" });

      res.json({
        title: info.title,
        thumbnail: info.thumbnail,
        formats: formats
      });
    } catch (e) {
      console.error("JSON parse error:", e);
      res.status(500).json({ error: "Failed to parse video info" });
    }
  });
});

app.post("/download", async (req, res) => {
  console.log("Download request received:", req.body);
  const videoUrl = req.body.url;
  const formatId = req.body.format_id || "best";

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
    // Check for cookies.txt
    const cookiesPath = path.join(__dirname, "cookies.txt");
    const ytArgs = [
      "--newline",
      "--no-warnings",
      "--no-cache-dir",
      "--force-ipv4",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "--add-header", "Accept-Language: en-US,en;q=0.9",
      "--extractor-args", "youtube:player_client=android,mweb",
      "-f", formatId,
      "-o", "-",
      videoUrl,
    ];

    if (fs.existsSync(cookiesPath)) {
        const stats = fs.statSync(cookiesPath);
        console.log(`Using cookies.txt for authentication (${stats.size} bytes)`);
        ytArgs.push("--cookies", cookiesPath);
    } else {
        console.log("No cookies.txt found, proceeding without auth");
    }

    const downloadProcess = spawn(ytDlpPath, ytArgs);

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

    let errorLog = "";

    // Log any errors from stderr (but don't send to client)
    downloadProcess.stderr.on("data", (data) => {
      const errorMsg = data.toString();
      errorLog += errorMsg; // Accumulate error log
      // Only log actual errors, not progress info
      if (errorMsg.includes("ERROR")) {
        console.error("yt-dlp error:", errorMsg);
      }
    });

    // Handle process errors
    downloadProcess.on("error", (error) => {
      console.error("Failed to spawn yt-dlp:", error);
      if (!headersSent) {
        res.status(500).json({ error: "Failed to start download: " + error.message });
        headersSent = true;
      }
    });

    // Handle process completion
    downloadProcess.on("close", (code) => {
      if (code !== 0 && !headersSent) {
        console.error(`yt-dlp exited with code ${code}`);
        // Send the accumulated error log to the client for debugging
        res.status(500).json({ 
            error: "Download failed", 
            details: errorLog 
        });
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
