const express = require("express");
require("./db/mongoose");
const userRoutes = require("./routers/user"); 
const taskRoutes = require("./routers/task");
const app = express();

app.use(express.json());
app.use(userRoutes)
app.use(taskRoutes)

module.exports = app