// This is 'app.js' File of Connect App - The Main Driving File of Connect

// Importing Required Modules
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');

// Creating an express app
const app = express();
const port = 3000;

// Importing Other Requirements
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

// Setting the App Requirements
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/peerjs', peerServer);

// Initializing the counter to 0 and user list to an empty array
let counter = 0;
let users = [];

// Home Page of Connect
app.get('/', function(req, res) {
    res.render('home');
});

// Create Room Page of Connect
app.get('/createRoom', function(req, res) {
    const roomId = uuidv4();
    ord = roomId;
    console.log(roomId);
    res.render('createRoom', { roomId: roomId });
});

// Join Room Page of Connect (GET)
app.get('/joinRoom', function(req, res) {
    res.render('joinRoom');
});

// Join Room Page of Connect (POST)
app.post('/joinRoom', function(req, res) {
    const requestedroomId = req.body.roomId;
    res.redirect(`/info/${requestedroomId}`);
});

// Info Page of Connect (GET)
app.get('/info/:roomId', function(req, res) {
    res.render('info', { roomId: req.params.roomId });
});

// Info Page of Connect (POST)
app.post('/info/:roomId', function(req, res) {

    // Extracting the User Filled Form Data
    const obj = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        phone: req.body.phone,
        nname: req.body.nname
    }

    let flag = false;

    // Checking whether there exits another user with similar credentials
    for (let i=0; i < users.length; i++) {
        if (users[i].fname === obj.fname && (users[i].nname === obj.nname || users[i].email === obj.email)) {
            flag = true;
            console.log("User Found with Same Name");
            break;
        }
    }

    // If the user entered credentials are unique, pushing the user in the user's list
    if (!flag) {
        users.push(obj);
        console.log("Users List: ", users);
        res.redirect(`/room/${req.params.roomId}`);
    }
    
    // If the user entered credentials are not unique, redirecting it to the formError Page
    else {
        res.redirect(`/formError/${req.params.roomId}`);
    }
});

// Form Error Page
app.get('/formError/:roomId', function(req, res) {
    res.render('formError', { roomId: req.params.roomId })
});

// Room Page
app.get('/room/:roomId', function(req, res) {

    // Extracting the Room ID
    const roomId = req.params.roomId;

    try {
        if (counter >= 10) {
            res.render('capacityFull', { roomId: roomId });
        } 
        else {
            res.render('room', {
                roomId: roomId,
                userFName: users[users.length - 1].fname,
                userLName: users[users.length - 1].lname,
                userEmail: users[users.length - 1].email,
                userPhone: users[users.length - 1].phone,
                userName: users[users.length - 1].nname,
            });
        }
    } catch (e) {
        res.redirect(`/info/${req.params.roomId}`);
    }
});

// Thank You Page
app.get('/thanks', function(req, res){
    res.render('thankYou');
});

// Establishing the connection
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {

        users[users.length - 1].id = userId;

        socket.join(roomId);
        counter++;
        
        console.log("peer-connection", counter, users);

        socket.to(roomId).emit('user-connected', userId, userName, users);

        // Message Connection 
        socket.on('message', message => {
            socket.to(roomId).emit('createMessage', message, userId, userName);
        });

        // Screen Sharing Enabling Connection
        socket.on('screen-share', (userId) => {
            socket.broadcast.to(roomId).emit('screen-sharing', userId, users);
        });

        // Screen Sharing Disabling Connection
        socket.on('stop-screen-share', (userId) => {
            socket.broadcast.to(roomId).emit('stop-screen-sharing', userId, users);
        });

        // Whiteboard Connection
        socket.on('draw', (lastX, lastY, offsetX, offsetY, pencilColor, pencilWidth) => {
            socket.broadcast.to(roomId).emit('drawing', lastX, lastY, offsetX, offsetY, pencilColor, pencilWidth);
        });

        socket.on('disconnect', () => {
            let index;
            for (let i = 0; i < counter; i++) {
                if (users[i] !== undefined && users[i].id === userId) {
                    index = i;
                    break;
                }
            }

            if (index !== undefined) {
                users.splice(index, 1);
                counter--;
            }

            console.log(`${userName} Disconnected`);
            socket.to(roomId).emit('user-disconnected', userId, userName, users);
        });
    });
});

// Error Page
app.get('*', function(req, res) {
    res.render('error');
});

// Testing the App
server.listen(process.env.PORT || port, function() {
    console.log(`Connect-App listening at http://localhost:${port}`);
});