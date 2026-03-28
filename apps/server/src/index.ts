import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import taskRoutes from './routes/tasks';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Attach Socket.io Native Server
const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: "*", // allow Next.js web and flutter mobile
        methods: ["GET", "POST", "PATCH"]
    }
});

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Routes
app.get('/', (_req, res) => {
    res.send('Welcome to Brokai Labs Assessment APIs');
});
app.use('/tasks', taskRoutes);

// Global Error Handler
app.use(errorHandler);

httpServer.listen(PORT, () => {
    console.log(`Server & WebSockets running on port ${PORT}`);
});
