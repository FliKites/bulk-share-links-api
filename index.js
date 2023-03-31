const path = require("path");
const express = require("express");
const multer = require("multer");
const csv = require("csv-stringify");
const fs = require("fs");
const cors = require("cors");

const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const csvDirPath = path.join(__dirname, "csv");
      const uploadsDirPath = path.join(__dirname, "uploads");
      if (!fs.existsSync(csvDirPath)) {
        fs.mkdirSync(csvDirPath);
      }
      if (!fs.existsSync(uploadsDirPath)) {
        fs.mkdirSync(uploadsDirPath);
      }
      cb(null, uploadsDirPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExt = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + fileExt);
    },
  }),
});

const PORT = process.env.PORT ?? 5000;
app.use(cors());
app.post("/upload", upload.array("videos"), (req, res) => {
  // `req.files` contains an array of uploaded files
  const uploadedFiles = req.files;
  // Generate an array of links to the uploaded files
  const fileLinks = uploadedFiles.map((file) => ({
    filename: file.originalname,
    link: `${req.protocol}://${req.get("host")}/${file.path}`,
  }));

  // Generate a CSV string from the file links
  csv.stringify(fileLinks, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }

    // Write the CSV file to disk
    const csvDirPath = path.join(__dirname, "csv");
    const csvFileName = `file-links-${Date.now()}.csv`;
    const csvFilePath = path.join(csvDirPath, csvFileName);
    fs.writeFile(csvFilePath, data, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
      }

      // Send the link to the CSV file to the client
      const csvFileLink = `${req.protocol}://${req.get(
        "host"
      )}/csv/${csvFileName}`;
      res.send(csvFileLink);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
