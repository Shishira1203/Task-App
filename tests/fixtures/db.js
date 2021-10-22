const mongoose = require("mongoose");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

let userOne,userTwo;
const setupDatabase = async()=> {
    await User.deleteMany()
    userOne = await new User( {
        name: "Shishir Karanth",
        email: "shishir.karanth@gmail.com",
        password: "sekret123**"
    });
    userTwo = await new User( {
        name: "Shishir Karanth",
        email: "soorya.karanth@gmail.com",
        password: "sekret123**"
    });
    await userOne.save()
    await userOne.generateAuthToken()
    await userTwo.save()
    await userTwo.generateAuthToken()
    const taskOne = new Task({description: "Testing using Jest",owner: userOne._id});
    const taskTwo = new Task({description: "Testing with Jest",owner: userOne._id});
    const taskThree = new Task({description: "Testing with Jest",owner: userTwo._id});
    await taskOne.save()
    await taskTwo.save()
    await taskThree.save()
    return {users: [userOne,userTwo],tasks:[taskOne,taskTwo,taskThree] };
}


module.exports = {
    setupDatabase
}