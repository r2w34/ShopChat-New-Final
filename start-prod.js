import { config } from 'dotenv';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
config({ path: join(__dirname, '.env') });

// Start remix-serve
const serve = spawn('npx', ['remix-serve', 'build/server/index.js'], {
  env: process.env,
  stdio: 'inherit'
});

serve.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

serve.on('close', (code) => {
  process.exit(code);
});
