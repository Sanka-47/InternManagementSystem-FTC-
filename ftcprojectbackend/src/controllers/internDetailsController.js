import {
  upsertInternDetails,
  getInternDetailsByInternId,
} from "../models/internDetailsModel.js";

export async function saveMyDetails(req, res) {
  try {
    const intern_id = req.user.sub;

    const {
      full_name,
      nic,
      email,
      home_address,
      phone,
      bank_branch,
      bank_account_number,
    } = req.body;

    const id_front_image = req.files?.id_front_image?.[0]?.filename || null;
    const id_back_image = req.files?.id_back_image?.[0]?.filename || null;

    if (!full_name || !nic || !email) {
      return res.status(400).json({ message: "Full name, NIC, and Email are required!" });
    }

    const row = await upsertInternDetails({
      intern_id,
      full_name,
      nic,
      email,
      home_address,
      phone,
      bank_branch,
      bank_account_number,
      id_front_image,
      id_back_image,
    });

    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}

export async function myDetails(req, res) {
  try {
    const intern_id = req.user.sub;
    const row = await getInternDetailsByInternId(intern_id);
    if (!row) {
      return res.status(404).json({ message: "Details not found!" });
    }
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error!" });
  }
}