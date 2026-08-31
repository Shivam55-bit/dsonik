require('dotenv').config();
const app = require('./src/index');

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`DSONIK backend running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is busy. Trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });
};

const PORT = Number(process.env.PORT || 5000);
startServer(PORT);
