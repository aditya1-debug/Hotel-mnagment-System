import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { connect, closeDatabase, clearDatabase } from './setup.js';
import app from '../app.js';

process.env.JWT_SECRET = 'test_secret';

before(connect);
after(closeDatabase);
beforeEach(clearDatabase);

test('registers a new customer and returns a usable token', async () => {
    const res = await request(app).post('/api/auth/register').send({
        name: 'Jane Customer',
        email: 'jane@test.com',
        password: 'password123',
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.role, 'customer');
    assert.ok(res.body.data.token);
});

test('rejects registering the same email twice', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Jane', email: 'dup@test.com', password: 'password123' });
    const res = await request(app).post('/api/auth/register').send({ name: 'Jane Again', email: 'dup@test.com', password: 'password123' });

    assert.equal(res.status, 400);
});

test('rejects login with the wrong password', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Jane', email: 'jane2@test.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'jane2@test.com', password: 'wrongpass' });

    assert.equal(res.status, 401);
});

test('blocks a customer from creating a restaurant', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'Jane', email: 'jane3@test.com', password: 'password123' });
    const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${register.body.data.token}`)
        .send({ name: 'Test', address: 'X' });

    assert.equal(res.status, 403);
});

test('allows an owner to create a restaurant', async () => {
    const register = await request(app).post('/api/auth/register').send({
        name: 'Tony Owner', email: 'owner@test.com', password: 'password123', role: 'owner',
    });
    const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${register.body.data.token}`)
        .send({ name: 'Test Place', address: 'X St' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, 'Test Place');
});
