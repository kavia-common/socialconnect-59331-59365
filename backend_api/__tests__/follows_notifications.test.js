'use strict';

const request = require('supertest');
const { startTestDB, stopTestDB, getApp } = require('../test/helpers/appHelper');
const { createAndLoginUser } = require('../test/helpers/authHelper');

describe('Follows & Notifications API', () => {
  let userA, tokenA;
  let userB, tokenB;

  beforeAll(async () => {
    await startTestDB();
    const a = await createAndLoginUser({ username: 'alpha', email: 'alpha@example.com' });
    userA = a.user; tokenA = a.token;
    const b = await createAndLoginUser({ username: 'beta', email: 'beta@example.com' });
    userB = b.user; tokenB = b.token;
  });

  afterAll(async () => {
    await stopTestDB();
  });

  test('POST /follows/:username follow then list followers/following', async () => {
    const follow = await request(getApp()).post(`/follows/${userA.username}`).set('Authorization', `Bearer ${tokenB}`);
    expect([200,201]).toContain(follow.status); // service returns 201; being tolerant

    const followers = await request(getApp()).get(`/follows/${userA.username}/followers`);
    expect(followers.status).toBe(200);
    expect(Array.isArray(followers.body)).toBe(true);

    const following = await request(getApp()).get(`/follows/${userB.username}/following`);
    expect(following.status).toBe(200);
  });

  test('Notifications list requires auth and returns array', async () => {
    const unauth = await request(getApp()).get('/notifications');
    expect(unauth.status).toBe(401);

    const auth = await request(getApp()).get('/notifications?onlyUnread=1&limit=10').set('Authorization', `Bearer ${tokenA}`);
    expect(auth.status).toBe(200);
    expect(Array.isArray(auth.body)).toBe(true);
  });
});
