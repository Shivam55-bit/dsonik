const Inquiry = require('../models/Inquiry');

exports.createInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, companyName, message, product, subject, source } = req.body;

    if (!name || (!email && !phone) || !message) {
      return res.status(400).json({ success: false, message: 'Name, contact info (email or phone), and message are required' });
    }

    const inquiry = await Inquiry.create({
      name: String(name).trim(),
      email: email ? String(email).trim().toLowerCase() : '',
      phone: phone ? String(phone).trim() : '',
      subject: subject ? String(subject).trim() : '',
      companyName: companyName ? String(companyName).trim() : '',
      message: String(message).trim(),
      product: product || undefined,
      source: source ? String(source).trim() : 'website'
    });

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully',
      data: {
        inquiryId: inquiry._id,
        inquiry
      },
      inquiry
    });
  } catch (error) {
    next(error);
  }
};

exports.getInquiries = async (req, res, next) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } }
      ];
    }

    const count = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: inquiries,
      inquiries
    });
  } catch (error) {
    next(error);
  }
};

exports.getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate('product');
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    return res.status(200).json({
      success: true,
      data: inquiry,
      inquiry
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (status) inquiry.status = status;
    if (adminNote !== undefined) inquiry.adminNote = adminNote;

    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully',
      data: inquiry,
      inquiry
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
