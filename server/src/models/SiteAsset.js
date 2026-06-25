import mongoose from 'mongoose';

const siteAssetSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const SiteAsset = mongoose.model('SiteAsset', siteAssetSchema);
export default SiteAsset;
