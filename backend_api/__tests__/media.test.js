'use strict';

const request = require('supertest');
const { startTestDB, stopTestDB, getApp } = require('../test/helpers/appHelper');
const { createAndLoginUser } = require('../test/helpers/authHelper');

describe('Media API', () => {
  let token;

  beforeAll(async () => {
    await startTestDB();
    const { token: t } = await createAndLoginUser({ username: 'uploader', email: 'uploader@example.com' });
    token = t;
  });

  afterAll(async () => {
    await stopTestDB();
  });

  test('POST /media/signature requires auth', async () => {
    const res = await request(getApp()).post('/media/signature').send({});
    expect(res.status).toBe(401);
  });

  test('POST /media/signature returns signature and payload when authed', async () => {
    const res = await request(getApp())
      .post('/media/signature')
      .set('Authorization', `Bearer ${token}`)
      .send({ folder: 'test-folder', resource_type: 'image' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cloudName');
    expect(res.body).toHaveProperty('apiKey');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('signature');
    expect(res.body).toHaveProperty('payload');
    expect(res.body.payload.folder).toBe('test-folder');
  });

  test('POST /media/upload requires auth', async () => {
    const res = await request(getApp()).post('/media/upload');
    expect(res.status).toBe(401);
  });

  test('POST /media/upload requires file', async () => {
    const res = await request(getApp()).post('/media/upload').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/file is required/i);
  });

  test('POST /media/upload succeeds with file (mocked Cloudinary)', async () => {
    const res = await request(getApp())
      .post('/media/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('folder', 'uploads')
      .attach('file', Buffer.from('fake-binary'), 'photo.jpg');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('url');
    expect(res.body).toHaveProperty('secureUrl');
    expect(res.body).toHaveProperty('publicId');
    expect(res.body.resourceType).toBe('image');
  });
});
