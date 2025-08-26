const io = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
    console.log('Client ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('url_shortened', (data) => {
    // Acknowledge receipt
    socket.emit('url_received', {
        received: true,
        shortenedURL: data.shortenedURL
    });
    
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
});


process.on('SIGINT', () => {
    socket.disconnect();
    process.exit(0);
});
