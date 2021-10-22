const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const Task = require("../src/models/task");
const { setupDatabase } = require("./fixtures/db");
let users, tasks;
beforeEach(async () => {
  let data = await setupDatabase();
  users = data.users;
  tasks = data.tasks;
});

test("Should be able to create task", async () => {
  const res = await request(app)
    .post("/tasks")
    .auth(users[0].tokens.at(-1).token, { type: "bearer" })
    .send({ description: "Jest testing is awesome", completed: true })
    .expect(201);
  const task = await Task.findById(res.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(true);
});

test("Should be able to retrieve tasks", async () => {
  let res = await request(app)
    .get("/tasks")
    .auth(users[0].tokens.at(-1).token, { type: "bearer" })
    .expect(200);
  expect(res.body.length).toBe(2);
  res = await request(app)
    .get("/tasks")
    .auth(users[1].tokens.at(-1).token, { type: "bearer" })
    .expect(200);
  expect(res.body.length).toBe(1);
});

test("Should not delete a task not owned by that user", async () => {
  await request(app)
    .delete(`/tasks/${tasks[0]._id}`)
    .auth(users[1].tokens.at(-1).token, { type: "bearer" })
    .expect(404);
  const notDeletedTask = await Task.findById(tasks[0]._id);
  expect(notDeletedTask).not.toBeNull();
});

test("Should delete a task owned by that user", async () => {
    await request(app)
      .delete(`/tasks/${tasks[0]._id}`)
      .auth(users[0].tokens.at(-1).token, { type: "bearer" })
      .expect(200);
    const notDeletedTask = await Task.findById(tasks[0]._id);
    expect(notDeletedTask).toBeNull();
});