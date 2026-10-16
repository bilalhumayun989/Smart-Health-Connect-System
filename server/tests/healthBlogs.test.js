const { test } = require('node:test');
const assert = require('node:assert/strict');
const articles = require('../data/health-blogs.json');

test('health blog dataset contains 15 distinct, complete disease articles', () => {
  assert.equal(articles.length, 15);
  assert.equal(new Set(articles.map(article => article.title)).size, 15);
  assert.equal(new Set(articles.map(article => article.image)).size, 15);
  for (const article of articles) {
    assert.ok(article.title);
    assert.ok(article.subheading);
    assert.ok(article.description.length > 300);
    assert.match(article.image, /^https:\/\/images\.unsplash\.com\//);
  }
});