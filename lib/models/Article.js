import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  // Client-generated string id (Date.now().toString(), or a fixed slug for seed content) -
  // kept as the stable identity used by the admin UI, separate from Mongo's own _id.
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    en: { type: String, default: '' },
    zh: { type: String, default: '' },
  },
  content: {
    en: { type: String, default: '' },
    zh: { type: String, default: '' },
  },
  tags: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    default: 'ayurveda',
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
  author: {
    type: String,
    default: 'Yuki',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

articleSchema.index({ status: 1, createdAt: -1 });

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

export default Article;
