const express = require("express");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jcjym.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("processedImage");
    const imageCollection = database.collection("imageWithData");

    app.post("/imageWithData", async (req, res) => {
      const process = req.body.process;
      const template = req.body.template;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const imageWithData = {
        process,
        template,
        image: imageBuffer,
      };
      const result = await imageCollection.insertOne(imageWithData);
      res.send(result);
    });

    //get api for services
    app.get("/imageWithData", async (req, res) => {
      const cursor = imageCollection.find({});
      const images = await cursor.toArray();
      res.send(images);
    });

    console.log("database connected");

    //Post api for booking
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello !");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
