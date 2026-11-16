const config = require('./config');

if (!config.jwtSecret) {
  console.error('Defina JWT_SECRET no arquivo .env');
  process.exit(1);
}

const app = require('./app');

app.listen(config.port, () => {
  console.log(`API em http://localhost:${config.port}`);
});
