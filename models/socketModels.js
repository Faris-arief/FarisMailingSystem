const { Server } = require('socket.io');

const Socket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'https://www.nikfarisarief.com/',
            methods: ['GET', 'POST'],
        },
    });

    let adminUsers = [];
    let allUsers = []; // All users in current chat room
    let roomMappedMessages = {};

    const alertAdmin = ()=>{
        adminUsers.forEach(admin=>{
          io.to(admin.id).emit('userslist', allUsers);
        })
    }

    function clearAdminArray() {
        adminUsers = [];
        console.log("Admin Array cleared!");
      }
      
    setInterval(clearAdminArray, 30 * 60 * 1000) 

    const CHAT_BOT = 'NFA Bot'; // Add this
    io.on('connection', (socket) => {
        console.log(`Connection created ${socket.id}`);

        //Admin section
        socket.on('admin_get_users', () => {
            if(!adminUsers.find(s=> s.id == socket.id))
                adminUsers.push(socket);
            alertAdmin()
        });

        socket.on('admin_get_room_messages', (data) => {
            const { username, name, room } = data;
            io.to(socket.id).emit('usermessages', roomMappedMessages[room]);
        });

        socket.on('admin_join_room', (data) => {
            const { room } = data; // Data sent from client when join_room event emitted
            socket.join(room); // Join the user to a socket room 
            let createdTime = Date.now();

            const enterMessage = {
                message: `Admin has joined the chat room`,
                username: CHAT_BOT,
                name: CHAT_BOT,
                createdTime,
            }

            console.log(`Admin has entered room ${room}`);
            // socket.to(room).emit('receive_message', enterMessage);
            roomMappedMessages[room].push(enterMessage);
        });

        socket.on('admin_send_message', (data) => {
            const { message, username, name, room, createdTime } = data;
            io.in(room).emit('receive_message', data); // Send to all users in room, including sender
            roomMappedMessages[room].push(
                {
                    message: message,
                    username: username,
                    name: name,
                    createdTime,
                });
        });

        socket.on('admin_end_room', (data) => {
            const { room, username, name, createdTime } = data;
            const leaveMessage = {
                message: `${username} has left the chat`,
                username: username,
                name: name,
                createdTime,
            }
            roomMappedMessages[room].push(
                leaveMessage
            );
            socket.leave(room);
            allUsers = allUsers.filter((user) => user.room != room);
            //This is where we should send an email of all the messages we have sent
        });

        socket.on('admin_leave', () => {
            allUsers = adminUsers.filter((admin) => admin.id != socket.id);
            //This is where we should send an email of all the messages we have sent
        });


        //Normal User Section
        socket.on('join_room', (data) => {
            const { username, name, room } = data; // Data sent from client when join_room event emitted
            socket.join(room); // Join the user to a socket room
            allUsers.push({ id: socket.id, username, room,name });

            let createdTime = Date.now();

            roomMappedMessages[room] = []

            const enterMessage = {
                message: `${name} has joined the chat room`,
                username: CHAT_BOT,
                name: CHAT_BOT,
                createdTime,
            }
            const introductoryMessage =
            {
                message: `Welcome ${name},\n if you would like to leave the chat just type 'leave' or 'exit'`,
                name: CHAT_BOT,
                username: CHAT_BOT,
                createdTime,
            };

            console.log("User entered with socket", socket.id);
            console.log("User entered with email", username);
            console.log(`User ${name} entered room ${room}`);
            console.log(`Bot will start conversing`, introductoryMessage)
            socket.to(room).emit('receive_message', enterMessage);
            io.in(room).emit('receive_message', introductoryMessage);

            roomMappedMessages[room].push(enterMessage, introductoryMessage);
            alertAdmin()
        });
        // We can write our socket event listeners in here...
        socket.on('send_message', (data) => {
            const { message, username, name, room, createdTime } = data;
            if (roomMappedMessages[room] == null)
                roomMappedMessages[room] = []


            io.in(room).emit('receive_message', data); // Send to all users in room, including sender
            console.log(`User ${username} spoke in room ${room}: ${message}`);
            roomMappedMessages[room].push(
                {
                    message: message,
                    username: username,
                    name: name,
                    createdTime,
                });

            const messageConfirmation = message.toLowerCase().trim()
            if (messageConfirmation == "leave" || messageConfirmation == "exit") {
                const leaveMessage = {
                    message: `${username} has left the chat`,
                    username: username,
                    name: name,
                    createdTime,
                }
                roomMappedMessages[room].push(
                    leaveMessage
                );

                console.log(`${username} has left the chat`,)
                io.to(room).to(socket.id).emit('leave', 'Please leave the chat!');


                socket.leave(room);
                allUsers = allUsers.filter((user) => user.id != socket.id);
                //socket.to(room).emit('chatroom_users', allUsers);
            }

        });

        socket.on('leave_room', (data) => {
            const { room, username, name, createdTime } = data;
            const leaveMessage = {
                message: `${username} has left the chat`,
                username: username,
                name: name,
                createdTime,
            }
            roomMappedMessages[room].push(
                leaveMessage
            );

            console.log(`${username} has left the chat`,)
            io.to(room).to(socket.id).emit('leave', 'Please leave the chat!');


            socket.leave(room);
            allUsers = allUsers.filter((user) => user.id != socket.id);
            alertAdmin()
        });
    })
}

module.exports = {Socket}