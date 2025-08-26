import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

interface PendingDelivery {
  response: any;
  lastAttempt: number;
}

const pendingDeliveries = new Map<string, PendingDelivery>();

let io: SocketIOServer;
const RETRY_INTERVAL_MS = 5000;

// Initialize Socket.IO
export function initializeSocketService(httpServer: HttpServer): void {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  // Handle client connections
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // If client has pending deliveries, resend immediately
    const pending = pendingDeliveries.get(socket.id);
    if (pending) {
      console.log(`Resending pending delivery to ${socket.id} on reconnect`);
      socket.emit("url_shortened", pending.response);
    }

    // Client acknowledges receipt
    socket.on("url_received", (ack) => {
      console.log(`Client ${socket.id} acknowledged receipt`);
      pendingDeliveries.delete(socket.id);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  setInterval(() => {
    const now = Date.now();
    for (const [clientId, delivery] of pendingDeliveries) {
      if (now - delivery.lastAttempt >= RETRY_INTERVAL_MS) {
        console.log(`Retrying delivery to ${clientId}`);
        io.to(clientId).emit("url_shortened", delivery.response);
        delivery.lastAttempt = now;
      }
    }
  }, 1000);
}

// Send shortened URL to client
export async function sendShortenedUrl(
  clientId: string,
  shortenedURL: string
): Promise<void> {
  const response = { shortenedURL };

  pendingDeliveries.set(clientId, { response, lastAttempt: Date.now() });

  io.to(clientId).emit("url_shortened", response);
}
