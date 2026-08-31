const Testimonial = require('../models/Testimonial');

const getInitials = (name) => {
  if (!name) return '';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

exports.getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    const formatted = testimonials.map((t) => ({
      ...t,
      initials: t.initials || getInitials(t.name)
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
      testimonials: formatted
    });
  } catch (error) {
    console.error('Get public testimonials error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAdminTestimonials = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const query = {};
    if (status) query.status = status;

    const testimonials = await Testimonial.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Testimonial.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      total,
      data: testimonials,
      testimonials
    });
  } catch (error) {
    console.error('Get admin testimonials error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin testimonials',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    return res.status(200).json({ success: true, data: testimonial, testimonial });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch testimonial' });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const { name, designation, company, message, rating, status = 'active', displayOrder = 0, image, initials } = req.body;

    if (!name || !String(name).trim() || !message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Name and message are required' });
    }

    const imagePath = req.file ? `/uploads/testimonials/${req.file.filename}` : (image || '');
    const computedInitials = initials ? String(initials).trim().toUpperCase() : getInitials(name);

    const testimonial = await Testimonial.create({
      name: String(name).trim(),
      designation: designation ? String(designation).trim() : '',
      company: company ? String(company).trim() : '',
      message: String(message).trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      image: imagePath,
      initials: computedInitials,
      status: status === 'inactive' ? 'inactive' : 'active',
      displayOrder: Number(displayOrder) || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial,
      testimonial
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const existing = await Testimonial.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.designation !== undefined) updateData.designation = String(req.body.designation).trim();
    if (req.body.company !== undefined) updateData.company = String(req.body.company).trim();
    if (req.body.message !== undefined) updateData.message = String(req.body.message).trim();
    if (req.body.rating !== undefined) updateData.rating = Math.min(5, Math.max(1, Number(req.body.rating) || 5));
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.body.displayOrder !== undefined) updateData.displayOrder = Number(req.body.displayOrder) || 0;
    if (req.body.name) updateData.initials = getInitials(req.body.name);

    if (req.file) {
      updateData.image = `/uploads/testimonials/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      updateData.image = req.body.image;
    }

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial,
      testimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    return res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete testimonial' });
  }
};
