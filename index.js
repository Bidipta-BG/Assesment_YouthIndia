const express = require("express")
const mongoose = require("mongoose")
const app = express()
const route = require("./route")

app.use(express.json())

mongoose.connect("mongodb+srv://Bidipta-BG:wHFCxvYIKQmhPro5@cluster0.n5vfx.mongodb.net/YouthIndiaCalenderApi")
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.log(err))


app.use("/", route)


app.listen(4000, function(){
    console.log("The server is running on port: "+ 4000)
})