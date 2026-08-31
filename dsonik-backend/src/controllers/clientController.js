const Client = require('../models/Client');

exports.getPublicClients = async (req, res) => {
  try {
    const clients = await Client.find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
      clients
    });
  } catch (error) {
    console.error('Get public clients error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAdminClients = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const query = {};
    if (status) query.status = status;

    const clients = await Client.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Client.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: clients.length,
      total,
      data: clients,
      clients
    });
  } catch (error) {
    console.error('Get admin clients error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin clients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    return res.status(200).json({ success: true, data: client, client });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch client' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { name, website, status = 'active', displayOrder = 0, logo } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Client name is required' });
    }

    const logoPath = req.file ? `/uploads/clients/${req.file.filename}` : (logo || '');

    const client = await Client.create({
      name: String(name).trim(),
      logo: logoPath,
      website: website ? String(website).trim() : '',
      status: status === 'inactive' ? 'inactive' : 'active',
      displayOrder: Number(displayOrder) || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client,
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const existing = await Client.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.website !== undefined) updateData.website = String(req.body.website).trim();
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.body.displayOrder !== undefined) updateData.displayOrder = Number(req.body.displayOrder) || 0;

    if (req.file) {
      updateData.logo = `/uploads/clients/${req.file.filename}`;
    } else if (req.body.logo !== undefined) {
      updateData.logo = req.body.logo;
    }

    const client = await Client.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client,
      client
    });
  } catch (error) {
    console.error('Update client error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    return res.status(200).json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete client' });
  }
};
