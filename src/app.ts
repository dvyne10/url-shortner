import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeSocketService } from './services/socketService';
import { createUrlRoutes } from './routes/urlRoutes';

let app: express.Application;
let server: any;

//middleware
function setupMiddleware(): void {
  app.use(cors());  
  app.use(express.json()); 
}

//routes
function setupRoutes(): void {
  app.use('/', createUrlRoutes());
}

export function initializeApp(port: number = 3000): void {
  app = express();
  server = createServer(app);
  
  initializeSocketService(server);
  
  setupMiddleware();
  setupRoutes();
}

export function startServer(): void {
  server.listen(3000, () => {
    console.log('Server running on port :::::3000');
  });
}