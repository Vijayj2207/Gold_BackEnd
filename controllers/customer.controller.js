const customerService = require("../services/customer.service.js");
const cloudinary = require("../config/cloudinary.ts");

// ── Create customer ───────────────────────────────────────────────────────────
exports.createCustomer = async (req, res) => {
  try {
    const data = {
      full_name:           req.body.full_name           || null,
      mobile_number:       req.body.mobile_number       || null,
      address:             req.body.address             || null,
      profile_picture_url: req.file ? req.file.path : (req.body.profile_picture_url || null),
    };

    const result = await customerService.createCustomer(data);
    res.status(201).json(result);
  } catch (error) {
    console.error("createCustomer error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ── Get all customers ─────────────────────────────────────────────────────────
exports.getCustomers = async (req, res) => {
  try {
    const result = await customerService.getCustomers();
    res.json(result);
  } catch (error) {
    console.error("getCustomers error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ── Get single customer ───────────────────────────────────────────────────────
exports.getCustomerById = async (req, res) => {
  try {
    const result = await customerService.getCustomerById(req.params.id);
    if (!result) return res.status(404).json({ error: "Customer not found" });
    res.json(result);
  } catch (error) {
    console.error("getCustomerById error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ── Update customer ───────────────────────────────────────────────────────────
exports.updateCustomer = async (req, res) => {
  try {
    // Fetch existing record so we keep old values for any field not sent
    const existing = await customerService.getCustomerById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Customer not found" });

    // If a new file was uploaded, delete the old Cloudinary image first
    let profile_picture_url = existing.profile_picture_url;
    if (req.file) {
      if (existing.profile_picture_url) {
        const publicId = extractPublicId(existing.profile_picture_url);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      profile_picture_url = req.file.path;
    }

    const data = {
      full_name:           req.body.full_name     ?? existing.full_name,
      mobile_number:       req.body.mobile_number ?? existing.mobile_number,
      address:             req.body.address       ?? existing.address,
      profile_picture_url,
    };

    const result = await customerService.updateCustomer(req.params.id, data);
    res.json(result);
  } catch (error) {
    console.error("updateCustomer error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ── Delete customer ───────────────────────────────────────────────────────────
exports.deleteCustomer = async (req, res) => {
  try {
    const existing = await customerService.getCustomerById(req.params.id);
    if (existing?.profile_picture_url) {
      const publicId = extractPublicId(existing.profile_picture_url);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    await customerService.deleteCustomer(req.params.id);
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("deleteCustomer error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ── Helper: extract public_id from Cloudinary URL ────────────────────────────
function extractPublicId(url) {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const withoutVersion = parts[1].replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}