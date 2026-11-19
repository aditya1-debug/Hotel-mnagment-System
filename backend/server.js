import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { routeNotFound, handleError } from './middleware/handleErrors.js';

import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.get('/', (req, res) => {
    res.send('server is running..');
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(routeNotFound);
app.use(handleError);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
