import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();
app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use('/', authRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
});