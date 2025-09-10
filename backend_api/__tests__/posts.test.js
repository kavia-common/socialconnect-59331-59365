'use strict';

const request = require('supertest');
const { startTestDB, stopTestDB, getApp } = require('../test/helpers/appHelper');
const { createAndLoginUser } = require('../test/helpers/authHelper');
const { Post } = require('../src/models');

describe('Posts API', () => {
  let tokenUserA;
  let userA;
  let tokenUserB;
  let userB;

  beforeAll(async () => {
    await startTestDB();
  });

  afterAll(async () => {
    await stopTestDB();
  });

  beforeEach(async () => {
    const a = await createAndLoginUser({ username: 'userA', email: 'a@example.com' });
    tokenUserA = a.token;
    userA = a.user;

    const b = await createAndLoginUser({ username: 'userB', email: 'b@example.com' });
    tokenUserB = b.token;
    userB = b.user;
  });

  test('POST /posts creates a post with valid media', async () => {
    const res = await request(getApp())
      .post('/posts')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        caption: 'Hello world',
        hashtags: ['nature', '#SunSet'],
        media: { url: 'https://example.com/img.jpg', type: 'image', publicId: 'p1', width: 640, height: 480 },
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.caption).toBe('Hello world');
    expect(res.body.media.type).toBe('image');
    expect(res.body.likeCount).toBe(0);
  });

  test('POST /posts validation requires media', async () => {
    const res = await request(getApp()).post('/posts').set('Authorization', `Bearer ${tokenUserA}`).send({ caption: 'x' });
    expect(res.status).toBe(400);
  });

  test('GET /posts/:id returns post', async () => {
    const created = await Post.create({
      author: userA._id,
      caption: 'My post',
      hashtags: ['fun'],
      media: { url: 'https://example.com/a.jpg', type: 'image' },
      isPublic: true,
    });
    const res = await request(getApp()).get(`/posts/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(String(created._id));
  });

  test('POST /posts/:id/like is idempotent; DELETE unlikes', async () => {
    const created = await Post.create({
      author: userA._id,
      caption: 'Like me',
      hashtags: [],
      media: { url: 'https://example.com/b.jpg', type: 'image' },
      isPublic: true,
    });

    const like1 = await request(getApp())
      .post(`/posts/${created._id}/like`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send();
    expect(like1.status).toBe(201);
    expect(like1.body.ok).toBe(true);
    expect(like1.body.liked).toBe(true);
    expect(like1.body.alreadyLiked || false).toBe(false);

    const like2 = await request(getApp())
      .post(`/posts/${created._id}/like`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send();
    expect(like2.status).toBe(201);
    expect(like2.body.ok).toBe(true);
    expect(like2.body.liked).toBe(true);
    expect(like2.body.alreadyLiked).toBe(true);

    const unlike = await request(getApp())
      .delete(`/posts/${created._id}/like`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send();
    expect(unlike.status).toBe(200);
    expect(unlike.body.ok).toBe(true);
    expect(unlike.body.liked).toBe(false);
    expect(typeof unlike.body.removed).toBe('boolean');
  });
});
