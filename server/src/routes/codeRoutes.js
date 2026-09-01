const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/execute", async (req, res) => {
  try {
    const { language, version, files, stdin } = req.body;

    if (!language || !files) {
      return res.status(400).json({
        error: "Language and files are required",
      });
    }

    const response = await axios.post(
      "YOUR_CLOUDFLARE_WORKER_URL",
      {
        language,
        version,
        files,
        stdin: stdin || "",
      },
      {
        timeout: 15000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Execution error:", error.message);

    res.status(500).json({
      error: "Code execution failed",
    });
  }
});

module.exports = router;