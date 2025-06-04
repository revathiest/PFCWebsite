const sequelize = require('./db');
const SiteContent = require('./models/siteContent');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await SiteContent.sync({ force: true }); // or { force: true } to drop/recreate
    console.log('SiteContent table synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to sync the database:', error);
    process.exit(1);
  }
})();
