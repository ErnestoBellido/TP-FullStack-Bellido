const app = require('./app/app');
const CONFIG = require('./app/config/config');

const PORT = CONFIG.PORT;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});
