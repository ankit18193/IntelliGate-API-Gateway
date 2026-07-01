import { Auth } from './index';
import { SDKError } from '../errors';

describe('Auth', () => {
  it('should initialize successfully with an API key', () => {
    const auth = new Auth('test-key');
    expect(auth).toBeDefined();
  });

  it('should generate correct Authorization headers', () => {
    const auth = new Auth('test-key');
    const headers = auth.getHeaders();
    expect(headers['Authorization']).toBe('Bearer test-key');
  });

  it('should allow empty initialization without error', () => {
    const auth = new Auth();
    expect(auth).toBeDefined();
  });

  it('should return empty headers if no API key is provided', () => {
    const auth = new Auth();
    const headers = auth.getHeaders();
    expect(headers).toEqual({});
  });

  it('should return empty headers if empty string is provided', () => {
    const auth = new Auth('   ');
    const headers = auth.getHeaders();
    expect(headers).toEqual({});
  });
});
