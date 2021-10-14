const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {sendWelcomeEmail,sendAccountCancellationEmail} = require("../emails/account");

const avatar = multer({
  // dest: "avatar",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    // cb(new Error("File must of type jpg"))
    // cb(undefined,true/false)-> upload accept or reject
    const fileExtension = file.mimetype.split("/")[1];
    if (fileExtension !== "jpeg" && fileExtension !== "png") {
      return cb(new Error("File must be of type jpeg or png"));
    }

    cb(undefined, true);
  },
});

const userRoutes = new express.Router();

userRoutes.post(
  "/users/me/avatar",
  auth,avatar.single("file"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250,height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

userRoutes.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email,user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

userRoutes.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send();
  }
});

userRoutes.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send();
  }
});

userRoutes.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send();
  }
});

userRoutes.get("/users/me", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch {
    res.status(500).send();
  }
});
userRoutes.get("/users/:id/avatar",async(req,res)=>{
  try{
    const user = await User.findById(req.params.id)
    if(!user || !user.avatar){
      throw new Error()
    }

    res.set("Content-Type","image/jpg");
    res.send(user.avatar);
  }catch(err){
    res.status(404).send()
  }
})

userRoutes.patch("/users/me", auth, async (req, res) => {
  const allowedUpdates = ["name", "email", "password", "age"];
  const updates = Object.keys(req.body);

  const isValid = updates.every((prop) => allowedUpdates.includes(prop));
  if (!isValid) return res.status(400).send({ error: "Invalid update!" });
  try {
    const user = req.user;
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});

userRoutes.delete("/users/me", auth, async (req, res) => {
  try {
    sendAccountCancellationEmail(req.user.email,req.user.name);
    await req.user.remove();
    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }
});

userRoutes.delete(
  "/users/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
module.exports = userRoutes;
