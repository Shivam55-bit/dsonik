require('dotenv').config();
const app = require('./src/index');

const PORT = Number(process.env.PORT || 5000);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`DSONIK backend running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

