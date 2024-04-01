const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Set up event listeners for WebSocket connections
wss.on('connection', (ws) => {
    console.log('A client has connected.');

    // Event listener for incoming messages from clients
    ws.on('message', (message) => {
        console.log('Received message:', message);

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Event listener for client disconnection
    ws.on('close', () => {
        console.log('A client has disconnected.');
    });
});

console.log('WebSocket server is running on port 8080');