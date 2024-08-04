const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

const username = encodeURIComponent(process.env.MONGODB_USERNAME);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);

const uri = `mongodb+srv://${username}:${password}@cluster0.fzhjhoe.mongodb.net/registractionFormDB?retryWrites=true&w=majority`;

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Registration schema
const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

// Model of registration schema
const Registration = mongoose.model("Registration", registrationSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await Registration.findOne({ email: email });

        if (!existingUser) {
            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(password, 10);

            const registrationData = new Registration({
                name,
                email,
                password: hashedPassword
            });

            await registrationData.save();

            res.redirect("/success");
        } else {
            console.log("User already exists");
            res.redirect("/error");
        }
    } catch (error) {
        console.log(error);
        res.redirect("/error");
    }
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/public/success.html");
});

app.get("/error", (req, res) => {
    res.sendFile(__dirname + "/public/error.html");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
