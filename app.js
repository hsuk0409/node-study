const express = require("express")()
const HTTP = require("http")

const server = HTTP.createServer(express)

const io = require("socket.io")(server)

express.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
})

const chat = io.of('/chat').on('connection', function (socket) {
    socket.on('chat message', function (data) {
        console.log('message from client: ', data);

        const name = socket.name = data.name;
        const room = socket.room = data.room;

        // room에 join한다
        socket.join(room);
        // room에 join되어 있는 클라이언트에게 메시지를 전송한다
        chat.to(room).emit('chat message', data.msg);
    });
});

server.listen(3000, function () {
    console.log("Socket IO server listening on port 3000")
})