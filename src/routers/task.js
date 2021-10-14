const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");

const taskRouter = express.Router();

taskRouter.post("/tasks", auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, owner: req.user._id });
    await task.save();
    res.status(201).send(task);
  } catch (er) {
    res.status(400).send();
  }
});

taskRouter.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.sortBy.length === 1) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
  }
  if (req.query.completed) {
    match.completed = req.query.completed.toLowerCase() === "true";
  }
  try {
    //const tasks = await Task.find({owner: req.user._id});
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (err) {
    res.status(500).send();
  }
});

taskRouter.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
});

taskRouter.patch("/tasks/:id", auth, async (req, res) => {
  const allowedUpdates = ["completed", "description"];
  const updates = Object.keys(req.body);

  const isValid = updates.every((prop) => allowedUpdates.includes(prop));
  if (!isValid) return res.status(400).send({ error: "Invalid update!" });
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send();
  }
});

taskRouter.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!deletedTask) res.status(404).send();
    res.send(deletedTask);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = taskRouter;
