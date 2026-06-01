const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

// Apply auth to all routes
router.use(protect);

// @GET /api/leads
router.get('/', async (req, res) => {
  try {
    const { status, source, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Lead.countDocuments(query)
    ]);

    res.json({ success: true, leads, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/leads/stats
router.get('/stats', async (req, res) => {
  try {
    const [statusCounts, sourceCounts, totalValue, recent] = await Promise.all([
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: null, total: { $sum: '$value' } } }]),
      Lead.find().sort('-createdAt').limit(5).lean()
    ]);

    const stats = { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };
    statusCounts.forEach(s => { stats[s._id] = s.count; });

    res.json({
      success: true,
      stats,
      sourceCounts,
      totalValue: totalValue[0]?.total || 0,
      recentLeads: recent,
      total: Object.values(stats).reduce((a, b) => a + b, 0)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/leads/:id
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/leads
router.post('/', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @PUT /api/leads/:id
router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/leads/:id/notes
router.post('/:id/notes', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    lead.notes.push({
      content: req.body.content,
      createdBy: req.user._id,
      createdByName: req.user.name
    });
    await lead.save();
    res.status(201).json({ success: true, lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @DELETE /api/leads/:id/notes/:noteId
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    lead.notes = lead.notes.filter(n => n._id.toString() !== req.params.noteId);
    await lead.save();
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/leads/:id/followups
router.post('/:id/followups', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    lead.followUps.push({
      ...req.body,
      createdBy: req.user._id,
      createdByName: req.user.name
    });
    await lead.save();
    res.status(201).json({ success: true, lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @PUT /api/leads/:id/followups/:followUpId
router.put('/:id/followups/:followUpId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const fu = lead.followUps.id(req.params.followUpId);
    if (!fu) return res.status(404).json({ success: false, message: 'Follow-up not found' });

    Object.assign(fu, req.body);
    await lead.save();
    res.json({ success: true, lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @DELETE /api/leads/:id/followups/:followUpId
router.delete('/:id/followups/:followUpId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    lead.followUps = lead.followUps.filter(f => f._id.toString() !== req.params.followUpId);
    await lead.save();
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
