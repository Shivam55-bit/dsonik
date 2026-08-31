const ContactInfo = require('../models/ContactInfo');

const getDefaultContactInfo = () => ({
  phoneNumbers: ['+91-120-4217390', '+91-120-4217391'],
  emailAddresses: ['info@dsonik.com', 'sales@dsonik.com'],
  officeAddress: 'DSONIK Pvt. Ltd., Industrial Area Site-4, Sahibabad, Ghaziabad — 201010',
  whatsappNumber: '+919876543210',
  mapUrl: 'https://maps.google.com/?q=Sahibabad+Industrial+Area',
  workingHours: 'Monday to Saturday, 9:00 AM to 6:00 PM',
  status: 'active'
});

exports.getPublicContactInfo = async (req, res) => {
  try {
    let contactInfo = await ContactInfo.findOne({ status: 'active' }).lean();
    if (!contactInfo) {
      contactInfo = await ContactInfo.create(getDefaultContactInfo());
    }
    return res.status(200).json({
      success: true,
      data: contactInfo,
      contactInfo
    });
  } catch (error) {
    console.error('Get public contact info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAdminContactInfo = async (req, res) => {
  try {
    let contactInfo = await ContactInfo.findOne().lean();
    if (!contactInfo) {
      contactInfo = await ContactInfo.create(getDefaultContactInfo());
    }
    return res.status(200).json({
      success: true,
      data: contactInfo,
      contactInfo
    });
  } catch (error) {
    console.error('Get admin contact info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin contact info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    const { phoneNumbers, emailAddresses, officeAddress, whatsappNumber, mapUrl, workingHours, status } = req.body;

    let contactInfo = await ContactInfo.findOne();

    const updateData = {};
    if (phoneNumbers !== undefined) {
      updateData.phoneNumbers = Array.isArray(phoneNumbers)
        ? phoneNumbers
        : String(phoneNumbers).split(',').map((p) => p.trim()).filter(Boolean);
    }
    if (emailAddresses !== undefined) {
      updateData.emailAddresses = Array.isArray(emailAddresses)
        ? emailAddresses
        : String(emailAddresses).split(',').map((e) => e.trim()).filter(Boolean);
    }
    if (officeAddress !== undefined) updateData.officeAddress = String(officeAddress).trim();
    if (whatsappNumber !== undefined) updateData.whatsappNumber = String(whatsappNumber).trim();
    if (mapUrl !== undefined) updateData.mapUrl = String(mapUrl).trim();
    if (workingHours !== undefined) updateData.workingHours = String(workingHours).trim();
    if (status !== undefined) updateData.status = status === 'inactive' ? 'inactive' : 'active';

    if (contactInfo) {
      contactInfo = await ContactInfo.findByIdAndUpdate(contactInfo._id, updateData, { new: true, runValidators: true });
    } else {
      contactInfo = await ContactInfo.create({ ...getDefaultContactInfo(), ...updateData });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact info updated successfully',
      data: contactInfo,
      contactInfo
    });
  } catch (error) {
    console.error('Update contact info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update contact info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
