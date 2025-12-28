/**
 * Articles API Smoke Tests
 * 
 * Tests articles/content endpoints
 */

import { testClient } from '../utils/testClient';

describe('Articles API Smoke Tests', () => {
  describe('GET /articles', () => {
    it('should return articles list (public endpoint)', async () => {
      const response = await testClient.get('/articles');

      // Articles are public, should return 200
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('articles');
      expect(Array.isArray(response.data.articles)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await testClient.get('/articles?page=1&limit=10');

      expect(response.status).toBe(200);
    });

    it('should support category filter', async () => {
      const response = await testClient.get('/articles?category=Eye%20Care');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /articles/:id', () => {
    it('should return 404 for non-existent article', async () => {
      const response = await testClient.get('/articles/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
    });
  });
});

