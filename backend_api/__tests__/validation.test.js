'use strict';

const express = require('express');
const request = require('supertest');
const { body } = require('express-validator');
const { validate } = require('../src/middleware/validation');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post(
    '/echo',
    validate([
      body('name').isString().isLength({ min: 2 }).withMessage('name too short'),
      body('age').optional().isInt({ min: 0, max: 120 }).toInt(),
    ]),
    (req, res) => res.json({ ok: true })
  );
  // error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message || 'error' });
  });
  return app;
}

describe('validation middleware', () => {
  const app = buildApp();

  test('passes validation and reaches handler', async () => {
    const res = await request(app).post('/echo').send({ name: 'Alice', age: 33 });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('fails validation with details and 400', async () => {
    const res = await request(app).post('/echo').send({ name: 'A', age: -1 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(Array.isArray(res.body.details)).toBe(true);
    const fields = res.body.details.map((d) => d.field);
    expect(fields).toContain('name');
  });
});
