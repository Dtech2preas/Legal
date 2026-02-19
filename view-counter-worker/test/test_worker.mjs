import worker from '../src/index.js';
import assert from 'assert';

// Mock KV
class MockKV {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async put(key, value) {
    this.store.set(key, value);
  }
}

async function runTests() {
  const env = {
    STATS_KV: new MockKV(),
  };
  const ctx = {
    waitUntil: () => {},
  };

  console.log('Running tests...');

  // Test 1: First visit to site1
  {
    const req = new Request('http://localhost/?url=site1');
    const res = await worker.fetch(req, env, ctx);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.site_url, 'site1');
    assert.strictEqual(data.site_views, 1);
    assert.strictEqual(data.total_global_views, 1);
    console.log('Test 1 passed: First visit to site1');
  }

  // Test 2: First visit to site2
  {
    const req = new Request('http://localhost/?url=site2');
    const res = await worker.fetch(req, env, ctx);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.site_url, 'site2');
    assert.strictEqual(data.site_views, 1);
    assert.strictEqual(data.total_global_views, 2); // Global should be 2 now
    console.log('Test 2 passed: First visit to site2');
  }

  // Test 3: Second visit to site1
  {
    const req = new Request('http://localhost/?url=site1');
    const res = await worker.fetch(req, env, ctx);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.site_url, 'site1');
    assert.strictEqual(data.site_views, 2); // Should be 2 now
    assert.strictEqual(data.total_global_views, 3); // Global should be 3 now
    console.log('Test 3 passed: Second visit to site1');
  }

  // Test 4: Missing URL parameter
  {
    const req = new Request('http://localhost/');
    const res = await worker.fetch(req, env, ctx);
    assert.strictEqual(res.status, 400);
    const text = await res.text();
    assert.match(text, /Missing "url"/);
    console.log('Test 4 passed: Missing URL parameter');
  }

  // Test 5: CORS headers
  {
    const req = new Request('http://localhost/?url=site1');
    const res = await worker.fetch(req, env, ctx);
    assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*');
    console.log('Test 5 passed: CORS headers present');
  }

  console.log('All tests passed!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
