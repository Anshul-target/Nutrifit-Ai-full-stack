const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

app.post("/api/analyze", upload.single("audio"), async (req, res) => {
    try {
        const form = new FormData();
        form.append("audio", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        form.append("include_pdf", "false");

        const response = await axios.post(
            "https://nutrifit-audiobot-backend.onrender.com/analyze",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ndHMJNVvj82BxaCvfRyEPxSDMPLXgciy33G47dvoxC0`,
                },
                maxBodyLength: Infinity,
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error("Full error:", err.response?.data || err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log("Proxy running on http://localhost:5000"));