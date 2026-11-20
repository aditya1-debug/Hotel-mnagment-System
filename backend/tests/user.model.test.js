import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { connect, closeDatabase } from './setup.js';
import User from '../models/User.js';

before(connect);
after(closeDatabase);

test('hashes the password before saving — never stores it in plaintext', async () => {
    const user = await User.create({ name: 'Jane', email: 'jane@test.com', password: 'password123' });
    assert.notEqual(user.password, 'password123');
});

test('matchPassword returns true for the right password and false otherwise', async () => {
    const user = await User.create({ name: 'Dave', email: 'dave@test.com', password: 'secret123' });
    assert.equal(await user.matchPassword('secret123'), true);
    assert.equal(await user.matchPassword('wrongpass'), false);
});

test('defaults role to customer when none is given', async () => {
    const user = await User.create({ name: 'Default', email: 'default@test.com', password: 'password123' });
    assert.equal(user.role, 'customer');
});

test('rejects a second user with the same email', async () => {
    await User.create({ name: 'First', email: 'dup@test.com', password: 'password123' });
    await assert.rejects(() =>
        User.create({ name: 'Second', email: 'dup@test.com', password: 'password123' })
    );
});
