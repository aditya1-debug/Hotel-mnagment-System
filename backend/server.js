import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
dotenv.config();
//midleware
app.use (cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('server is running..');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));