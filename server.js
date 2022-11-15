const express = require('express');
const {v4: uuidv4 } = require('uuid');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

//register view engine
app.set('view engine', 'ejs');

//static files
app.use(express.static('public'));
//use peerjs
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.render('index', {title: 'Home'});
})

app.get('/room', (req, res) => {
    // generate an id for user
    res.redirect(`/${uuidv4()}`);
    console.log('generating new user id');
})

// create a new url with the specific uuid
app.get('/:room', (req, res) => {
    const roomId = req.params.room;
    res.render('newcall', {title: `Room ${roomId}`, roomId: roomId });
    console.log(`specific room: ${roomId}`);
})

// create an io connection - allowing the user to join the room
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        console.log('we have joined the room');

        //receive and send message/chat
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message);
        })
    })
})
server.listen(3030);