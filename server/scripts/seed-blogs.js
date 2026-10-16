const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const Blog = require('../models/Blog');

const articles = require('../data/health-blogs.json');
const apply = process.argv.includes('--apply');
const expectedDatabase = process.argv.find(arg => arg.startsWith('--database='))?.slice('--database='.length);

function validateArticles() {
  if (articles.length !== 15) throw new Error('Expected exactly 15 blog articles');
  if (new Set(articles.map(article => article.title)).size !== articles.length) throw new Error('Blog titles must be unique');
  if (new Set(articles.map(article => article.image)).size !== articles.length) throw new Error('Each blog must have a unique image');
  for (const article of articles) {
    if (!article.title || !article.subheading || !article.description || !/^https:\/\/images\.unsplash\.com\//.test(article.image)) {
      throw new Error('Every blog must have article text and a valid Unsplash image URL');
    }
  }
}

async function verifyImages() {
  await Promise.all(articles.map(async article => {
    const response = await fetch(article.image, { signal: AbortSignal.timeout(20000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
      throw new Error('Image is unavailable for: ' + article.title);
    }
    if ((await response.arrayBuffer()).byteLength < 1000) throw new Error('Image response is too small for: ' + article.title);
  }));
}

async function main() {
  validateArticles();
  if (apply && !expectedDatabase) throw new Error('Apply requires --database=<configured database name>');
  await verifyImages();
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const database = mongoose.connection.db.databaseName;
  const before = await Blog.countDocuments();
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', database, existingBlogs: before, replacementBlogs: articles.length, verifiedImages: articles.length }));
  if (!apply) {
    console.log('Preview only. To replace only blog records, rerun with --apply --database=' + database);
    return;
  }
  if (expectedDatabase !== database) throw new Error('Database name does not match --database=' + expectedDatabase);

  const existing = await Blog.find().lean();
  const backupPath = path.resolve(__dirname, '../backups', 'blogs-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2), { flag: 'wx' });

  const records = articles.map(({ title, subheading, description, image }) => ({
    title,
    subheading,
    description,
    blogImage: image,
    descriptionImage: image,
  }));
  try {
    await Blog.deleteMany({});
    await Blog.insertMany(records);
  } catch (error) {
    await Blog.deleteMany({});
    if (existing.length) await Blog.insertMany(existing);
    throw error;
  }

  const inserted = await Blog.find().select('title blogImage descriptionImage').lean();
  if (inserted.length !== articles.length || new Set(inserted.map(blog => blog.title)).size !== articles.length) {
    throw new Error('Database verification failed after blog replacement');
  }
  console.log(JSON.stringify({ insertedBlogs: inserted.length, backup: backupPath }));
}

main().catch(error => {
  console.error('Blog seed stopped:', error.message?.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/g, '[database URI redacted]'));
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());