const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SiteContent = sequelize.define('SiteContent', {
  section: { type: DataTypes.STRING, allowNull: false, unique: true },
  content: { type: DataTypes.TEXT, allowNull: false },
}, {
  timestamps: false
});

module.exports = SiteContent;
