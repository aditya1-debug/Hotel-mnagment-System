import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import createToken from '../utils/tokenUtils.js';

process.env.JWT_SECRET = 'test_secret';

test('createToken signs a token carrying the user id and role', () => {
    const token = createToken('abc123', 'customer');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(decoded.id, 'abc123');
    assert.equal(decoded.role, 'customer');
});

test('a token signed with one secret fails verification against another', () => {
    const token = createToken('abc123', 'customer');
    assert.throws(() => jwt.verify(token, 'a_different_secret'));
});
