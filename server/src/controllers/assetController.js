import SiteAsset from '../models/SiteAsset.js';

const HOME_IMAGE_KEY = 'homeImage';

export const getHomeImage = async (_req, res) => {
  const asset = await SiteAsset.findOne({ key: HOME_IMAGE_KEY });
  if (!asset) return res.status(404).json({ message: 'Home image has not been uploaded yet' });
  res.json(asset);
};

export const uploadHomeImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Home image file is required' });

  const asset = await SiteAsset.findOneAndUpdate(
    { key: HOME_IMAGE_KEY },
    {
      key: HOME_IMAGE_KEY,
      fileUrl: `/uploads/home/${req.file.filename}`,
      uploadedAt: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(asset);
};
