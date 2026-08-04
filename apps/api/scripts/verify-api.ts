import request from 'supertest';
import app from '../src/app';
import { getDriver, closeDriver } from '../src/database/neo4j';

async function verifyAPI() {
  try {
    getDriver();

    const endpoints = [
      { route: '/api/health', method: 'get' },
      { route: '/api/dashboard/summary', method: 'get' },
      { route: '/api/dashboard/high-impact-suppliers', method: 'get' },
      { route: '/api/dashboard/single-points-of-failure', method: 'get' },
      { route: '/api/products', method: 'get' },
      { route: '/api/risks', method: 'get' },
      { route: '/api/suppliers', method: 'get' },
    ];

    let hasError = false;

    for (const ep of endpoints) {
      console.log(`Testing ${ep.method.toUpperCase()} ${ep.route}...`);
      const res = await request(app).get(ep.route);
      
      if (res.status !== 200) {
        console.error(`  ❌ Failed with status ${res.status}`);
        hasError = true;
      } else if (!res.body.data && !res.body.status) {
        console.error(`  ❌ Failed: missing data payload`);
        hasError = true;
      } else {
        console.log(`  ✅ PASS`);
      }
    }

    if (hasError) {
      console.error('\n❌ API Verification Failed');
      process.exit(1);
    } else {
      console.log('\n✅ All API routes verified successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('API Verification error:', error);
    process.exit(1);
  } finally {
    await closeDriver();
  }
}

verifyAPI();
