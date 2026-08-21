const Client = require('../models/Client');

// @desc    Get all clients for user
// @route   GET /api/clients
const getClients = async (req, res) => {
  const clients = await Client.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(clients);
};

// @desc    Get single client
// @route   GET /api/clients/:id
const getClient = async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, userId: req.user._id });
  if (!client) return res.status(404).json({ message: 'Client not found' });
  res.json(client);
};

// @desc    Create client
// @route   POST /api/clients
const createClient = async (req, res) => {
  const { name, email, phone, address, company } = req.body;
  if (!name) return res.status(400).json({ message: 'Client name is required' });

  const client = await Client.create({ userId: req.user._id, name, email, phone, address, company });
  res.status(201).json(client);
};

// @desc    Update client
// @route   PUT /api/clients/:id
const updateClient = async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, userId: req.user._id });
  if (!client) return res.status(404).json({ message: 'Client not found' });

  Object.assign(client, req.body);
  const updated = await client.save();
  res.json(updated);
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
const deleteClient = async (req, res) => {
  const client = await Client.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!client) return res.status(404).json({ message: 'Client not found' });
  res.json({ message: 'Client removed' });
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient };
