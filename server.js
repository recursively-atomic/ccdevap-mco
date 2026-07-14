const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const { connectToMongo } = require('./private/connection');
const { createUser } = require('./private/controllers/users');
const server = express();

const handlebars = expressHandlebars.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        eq: (a, b) => a == b
    }
});


server.engine('hbs', handlebars.engine);

server.set('view engine', 'hbs');
server.set('views', path.join(__dirname, 'views'));

server.use(express.json());
server.use(express.static(path.join(__dirname, 'public'))); // Exposes every file in the public folder

server.get('/', (req, res) => {
    res.render('index', {
        page: '/',
        script: '/scripts/index.js'
    });
});

server.get("/register", (req, res) => {
    res.render('register', { message: "user registration page" });
});

server.post("/register", async (req, res) => {
     try {
        const user = createUser(req.body);
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Registration Failed!' });
    }
});

server.get('/login', (req, res) => {
    res.render('login', { message: "user login page"});
});

server.post("/login", async(req,res)=>{
    try{
        // create email and this is in html name="email"
        const email = req.body.email;
        const password = req.body.password;
          //     database email name : current email
        const userEmail = await Users.findOne({emailAddress: email});
        if(userEmail.password === password){
            res.status(201).render("index");    
        }else{
            res.send("Invalid login Details");
        }
    }catch(error){
        res.status(400).send("invalid Email");
    }
});

server.get('/user-profile', (req, res) => {
    res.render('user', {
        page: '/user-profile',
        script: '/scripts/user/profile.js'
    });
});

server.get('/admin-profile', (req, res) => {
    res.render('admin', {
        page: '/admin-profile',
        script: '/scripts/admin/admin-users.js'
    });
});

connectToMongo((err) => {
    if (err) {
        console.error('Server Not Started!');
    } else {
        server.listen(process.env.SERVER_PORT, () => {
            console.log(`Server Running On http://localhost:${process.env.SERVER_PORT}!`);
        });
    }
});