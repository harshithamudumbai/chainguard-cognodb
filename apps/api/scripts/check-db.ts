import { getDriver, closeDriver } from '../src/database/neo4j';
import { config } from '../src/config';

async function checkDatabase() {
  console.log(`Checking connection to: ${config.COGNODB_URI}`);
  
  try {
    const driver = getDriver();
    const session = driver.session();

    try {
      const result = await session.run('RETURN 1 AS test');
      const testVal = result.records[0].get('test').toNumber();
      
      if (testVal === 1) {
        console.log('CognoDB connection: PASS');
        console.log(`Driver protocol: ${config.COGNODB_URI.split(':')[0]}`);
        console.log('Test query: PASS');
      } else {
        throw new Error('Test query returned unexpected result');
      }
    } finally {
      await session.close();
      console.log('Session cleanup: PASS');
    }
  } catch (error) {
    console.error('Database connection: FAIL');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  } finally {
    await closeDriver();
  }
}

checkDatabase();
