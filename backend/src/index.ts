import express from 'express';
import cors from 'cors';
import { config } from './config';
import emailRoutes from './routes/emailRoutes';
// import './queues/emailQueue'; // Initialize queue and worker

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/emails', emailRoutes);

app.get('/ping', (req, res) => res.json({ ok: true }));

app.post('/echo', (req, res) => {
  res.json({ body: req.body });
});

app.listen(config.app.port, () => {
  console.log(`Server running on port ${config.app.port}`);
});
