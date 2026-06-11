import { describe, it, expect } from 'vitest';
import {
  getJwtPayload,
  getUserIdFromToken,
  getTokenExpiresAt,
  getIsManagerFromToken,
} from '../../utils/jwt';

function createToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'fake-signature'
  return `${header}.${body}.${signature}`
}

describe('getJwtPayload', () => {
  it('decodes a valid payload', () => {
    expect(getJwtPayload(createToken({ a: 1 }))).toEqual({ a: 1 });
  });

  it('returns null for createToken with less than 3 parts', () => {
    expect(getJwtPayload('only.two')).toBeNull();
  });

  it('returns null for invalid base64', () => {
    expect(getJwtPayload('a.@@@.c')).toBeNull();
  });

  it('returns null for non-JSON payload', () => {
    const bad = btoa('not-json').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(getJwtPayload(`header.${bad}.sig`)).toBeNull();
  });
});

describe('getUserIdFromToken', () => {
  it('extracts user_id, sub, or id', () => {
    expect(getUserIdFromToken(createToken({ user_id: 10 }))).toBe(10);
    expect(getUserIdFromToken(createToken({ sub: '20' }))).toBe(20);
    expect(getUserIdFromToken(createToken({ id: 30 }))).toBe(30);
  });

  it('returns null when no valid id', () => {
    expect(getUserIdFromToken(createToken({}))).toBeNull();
    expect(getUserIdFromToken('invalid')).toBeNull();
  });

  it('returns null for non-numeric values', () => {
    expect(getUserIdFromToken(createToken({ user_id: 'abc' }))).toBeNull();
  });
});

describe('getTokenExpiresAt', () => {
  it('returns exp when present and number', () => {
    expect(getTokenExpiresAt(createToken({ exp: 123 }))).toBe(123);
  });

  it('returns null when missing or invalid', () => {
    expect(getTokenExpiresAt(createToken({}))).toBeNull();
    expect(getTokenExpiresAt(createToken({ exp: 'not-a-number' }))).toBeNull();
  });
});

describe('getIsManagerFromToken', () => {
  it('returns true for true/1/"true"', () => {
    expect(getIsManagerFromToken(createToken({ is_manager: true }))).toBe(true);
    expect(getIsManagerFromToken(createToken({ is_manager: 1 }))).toBe(true);
    expect(getIsManagerFromToken(createToken({ is_manager: 'True' }))).toBe(true);
  });

  it('returns false for false/0/"false"/missing', () => {
    expect(getIsManagerFromToken(createToken({ is_manager: false }))).toBe(false);
    expect(getIsManagerFromToken(createToken({ is_manager: 0 }))).toBe(false);
    expect(getIsManagerFromToken(createToken({ is_manager: 'false' }))).toBe(false);
    expect(getIsManagerFromToken(createToken({}))).toBe(false);
  });
});