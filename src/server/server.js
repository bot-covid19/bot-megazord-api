import express from 'express';
import cors from 'cors';

import v1 from '../api/v1';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  const msg = 'Unset Twilio SID or TOKEN environment variables.\n' +
  'Please create a .env file on the root of the project with those values filled.';
  throw new Error(msg);
}

const app = express();

const { PORT = 3000 } = process.env;

app.use(cors());

app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(express.json());

// v1 routes
app.use('/v1', v1);

// 404 handler (throw error)
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    errors: {
      message: err.message
    }
  });
});

app.listen(PORT, () => console.log(`App Listening on port ${PORT}`));

export default app;