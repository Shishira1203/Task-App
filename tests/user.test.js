const request = require("supertest");

const app = require("../src/app");
const User = require("../src/models/user");
const {setupDatabase} = require("./fixtures/db");
let users,tasks;
beforeEach(async ()=> {
    let data = await setupDatabase()
    users = data.users;
    tasks = data.tasks;
});

test("Should signup a new user", async () => {
  const res = await request(app)
    .post("/users")
    .send({
      name: "Shishir",
      email: "task.karanth@gmail.com",
      password: "MyPass777!",
    })
    .expect(201);
  const user = await User.findOne({ email: res.body.user.email });
  expect(user).not.toBeNull();
  expect(res.body.user).toMatchObject({
    name: "Shishir",
    email: "task.karanth@gmail.com",
  });
});

test("Should login existing user", async () => {
  const res = await request(app)
    .post("/users/login")
    .send({
      email: users[0].email,
      password: "sekret123**",
    })
    .expect(200);
  const user = await User.findById(users[0]._id);
  expect(user).not.toBeNull();
  expect(user.tokens.at(-1).token).toEqual(res.body.token);
});

test("Should not login non-existent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: users[0].email,
      password: users[0].password + "kdjfkls",
    })
    .expect(400);
});

test("Should be able to read profile if authenticated", async () => {
  await request(app)
    .get("/users/me")
    .auth(users[0].tokens.at(-1).token, { type: "bearer" })
    .expect(200);
});

test("Should not be able to read profile if not authenticated", async () => {
  await request(app).get("/users/me").expect(401);
});

test("Should be able to delete account if authenticated", async () => {
  await request(app)
    .delete("/users/me")
    .auth(users[0].tokens.at(-1).token, { type: "bearer" })
    .expect(200);
  const user = await User.findById(users[0]._id);
  expect(user).toBeNull();
});

test("Should not be able to delete account if not authenticated", async () => {
  await request(app).delete("/users/me").expect(401);
});

test("Should upload avatar image if authenticated", async () => {
  await request(app)
    .post("/users/me/avatar")
    .auth(users[0].tokens.at(-1).token, { type: "bearer" })
    .attach("file", "tests/fixtures/image.png")
    .expect(200);

    const user = await User.findById(users[0]._id);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should not upload avatar image of type docs", async () => {
    await request(app)
      .post("/users/me/avatar")
      .auth(users[0].tokens.at(-1).token, { type: "bearer" })
      .attach("file", "tests/fixtures/dummy.pdf")
      .expect(400);
});

test("Should update valid user fields",async()=> {
    await request(app).patch("/users/me").auth(users[0].tokens.at(-1).token, { type: "bearer" }).send({name: "Shishira SK"}).expect(200);
    const user = await User.findById(users[0]._id);
    expect(user.name).toBe("Shishira SK");
})

test("Should not update invalid user fields",async()=> {
    await request(app).patch("/users/me").auth(users[0].tokens.at(-1).token, { type: "bearer" }).send({location: "ShishirKaranth"}).expect(400);
})