'use strict';

const request = require('supertest');
const { startTestDB, stopTestDB, getApp } = require('../test/helpers/appHelper');

describe('Auth API', () => {
  beforeAll(async () => {
    await startTestDB();
  });

  afterAll(async () => {
    await stopTestDB();
  });

  test('POST /auth/signup creates a user and returns token', async () => {
    const res = await request(getApp())
      .post('/auth/signup')
      .send({ username: 'alice', email: 'alice@example.com', password: 'Password123!' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.username).toBe('alice');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  test('POST /auth/signup validation errors', async () => {
    const res = await request(getApp()).post('/auth/signup').send({ username: 'a' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('details');
  });

  test('POST /auth/login with email works', async () => {
    // signup first
    await request(getApp())
      .post('/auth/signup')
      .send({ username: 'bob', email: 'bob@example.com', password: 'Password123!' })
      .expect(201);

    const res = await request(getApp())
      .post('/auth/login')
      .send({ emailOrUsername: 'bob@example.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('bob');
  });

  test('POST /auth/login with username works', async () => {
    const res = await request(getApp())
      .post('/auth/login')
      .send({ emailOrUsername: 'bob', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('GET /auth/me requires JWT and returns profile', async () => {
    // login to get token
    const login = await request(getApp())
      .post('/auth/login')
      .send({ emailOrUsername: 'bob', password: 'Password123!' });
    const token = login.body.token;

    const res = await request(getApp()).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('bob');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  test('GET /auth/me unauthorized without token', async () => {
    const res = await request(getApp()).get('/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /auth/ping returns ok with valid token', async () => {
    const login = await request(getApp())
      .post('/auth/login')
      .send({ emailOrUsername: 'bob', password: 'Password123!' });
    const token = login.body.token;

    const res = await request(getApp()).get('/auth/ping').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user).toBeTruthy();
  });
});
