const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const port = 5500;
const app = express();

// Connexion DB
connectDB();


//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// NAMESPACES
app.use("/post", require("./routes/post.routes"));
app.use("/api/auth", require("./routes/user.routes"));
app.use("/api/spotify", require("./routes/spotify.routes"));
app.use("/api/spotify/playlist", require("./routes/playlist.routes"));

// Start a server
app.listen(port, () => console.log("Le serveur a démarré au port " + port))