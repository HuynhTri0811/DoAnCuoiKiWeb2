const createApp = require('./src/interfaces/http/createApp');
const db = require('./src/infrastructure/persistence/sequelize/models/db');

const app = createApp();
const port = process.env.PORT || 3000;

db.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}).catch(error => {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
});
