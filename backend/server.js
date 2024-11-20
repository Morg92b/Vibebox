const express = require("express");
const port = 5500
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// NAMESPACES
app.use("/post", require("./routes/post.routes"));
// app.use("/get", require("./routes/post.routes"));
// app.use("/put", require("./routes/post.routes"));
// app.use("/delete", require("./routes/post.routes"));


// Start a server
app.listen(port, () => console.log("Le serveur a démarré au port " + port))