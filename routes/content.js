const express = require('express');
const router = express.Router();
const SiteContent = require('../models/siteContent');

router.get('/:section', async (req, res) => {
  const { section } = req.params;
  try {
    const record = await SiteContent.findOne({ where: { section } });
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json({ content: record.content });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
