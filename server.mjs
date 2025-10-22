import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/'
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`✅ Client ${socket.id} joined session ${sessionId}`);
  });

  socket.on('chat-message', async (data) => {
    console.log('💬 Received message:', data);
    io.to(data.sessionId).emit('chat-response', {
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// CORS middleware for all routes
// NOTE: We don't use express.json() because Remix handles body parsing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Handle OPTIONS preflight for API routes explicitly
app.options('/api/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});

// Health check endpoint (BEFORE Remix)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket status endpoint (BEFORE Remix)
app.get('/socket/status', (req, res) => {
  res.json({
    status: 'running',
    activeConnections: io.engine.clientsCount || 0,
    timestamp: new Date().toISOString()
  });
});

// Serve static files
app.use(express.static("build/client", {
  immutable: true,
  maxAge: "1y"
}));

// Serve public files (for widget)
app.use(express.static("public", {
  maxAge: "1h"
}));

// Handle all OTHER routes with Remix
app.all("*", createRequestHandler({
  build: await import("./build/server/index.js"),
  mode: process.env.NODE_ENV || "production"
}));

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Shopify App URL: ${process.env.SHOPIFY_APP_URL}`);
  console.log(`🔌 Socket.IO: Enabled on /socket.io/`);
  console.log(`🌐 CORS: Enabled for all origins`);
});
