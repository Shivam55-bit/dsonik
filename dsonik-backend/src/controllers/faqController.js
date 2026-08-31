const Faq = require('../models/Faq');

exports.getPublicFaqs = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;

    const faqs = await Faq.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
      faqs
    });
  } catch (error) {
    console.error('Get public faqs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAdminFaqs = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 100 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const faqs = await Faq.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Faq.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: faqs.length,
      total,
      data: faqs,
      faqs
    });
  } catch (error) {
    console.error('Get admin faqs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin FAQs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    return res.status(200).json({ success: true, data: faq, faq });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch FAQ' });
  }
};

exports.createFaq = async (req, res) => {
  try {
    const { question, answer, category = 'general', status = 'active', displayOrder = 0 } = req.body;

    if (!question || !String(question).trim() || !answer || !String(answer).trim()) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }

    const faq = await Faq.create({
      question: String(question).trim(),
      answer: String(answer).trim(),
      category: category ? String(category).trim() : 'general',
      status: status === 'inactive' ? 'inactive' : 'active',
      displayOrder: Number(displayOrder) || 0
    });

    return res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq,
      faq
    });
  } catch (error) {
    console.error('Create FAQ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create FAQ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const existing = await Faq.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    const updateData = {};
    if (req.body.question !== undefined) updateData.question = String(req.body.question).trim();
    if (req.body.answer !== undefined) updateData.answer = String(req.body.answer).trim();
    if (req.body.category !== undefined) updateData.category = String(req.body.category).trim();
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.body.displayOrder !== undefined) updateData.displayOrder = Number(req.body.displayOrder) || 0;

    const faq = await Faq.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq,
      faq
    });
  } catch (error) {
    console.error('Update FAQ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update FAQ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    return res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete FAQ' });
  }
};
