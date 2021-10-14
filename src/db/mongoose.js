const mongoose=require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_STR, {
    useNewUrlParser: true,
} );




