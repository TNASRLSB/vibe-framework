/**
 * TEST FILE: Exposed Secrets and Credentials
 *
 * This file contains INTENTIONALLY EXPOSED credentials for testing.
 * All keys/tokens are FAKE and for testing only.
 *
 * Expected detections:
 * - AWS-001: AWS Access Key ID
 * - AWS-002: AWS Secret Access Key
 * - GH-001: GitHub Personal Access Token
 * - STRIPE-001: Stripe Live Secret Key
 * - STRIPE-002: Stripe Test Secret Key
 * - SLACK-001: Slack Bot Token
 * - SG-001: SendGrid API Key
 * - OAI-001: OpenAI API Key
 * - ANT-001: Anthropic API Key
 * - JWT-001: JWT Token
 * - PK-001: RSA Private Key
 */

// ============================================
// CLOUD PROVIDER KEYS
// ============================================

// AWS-001: AWS Access Key ID
const AWS_ACCESS_KEY = 'AKIAIOSFODNN7EXAMPLE';

// AWS-002: AWS Secret Access Key
const awsConfig = {
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  region: 'us-east-1'
};

// GCP-001: Google Cloud API Key
const GOOGLE_API_KEY = 'AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe';

// ============================================
// CODE PLATFORM TOKENS
// ============================================

// GH-001: GitHub Personal Access Token
const GITHUB_TOKEN = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const github_pat = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';

// GH-003: GitHub App Token
const githubAppToken = 'ghu_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// GL-001: GitLab Personal Access Token
const GITLAB_TOKEN = 'glpat-xxxxxxxxxxxxxxxxxxxx';

// ============================================
// PAYMENT PROVIDERS
// ============================================

// STRIPE-001: Stripe LIVE Secret Key (CRITICAL!)
const stripeLiveKey = 'sk_live_FAKE_KEY_FOR_TESTING_00000000000000000000000000000000000000';

// STRIPE-002: Stripe Test Secret Key
const stripeTestKey = 'sk_test_FAKE_KEY_FOR_TESTING_00000000000000000000000000000000000000';

// STRIPE-003: Stripe Restricted Key
const stripeRestrictedKey = 'rk_live_FAKE_KEY_FOR_TESTING_00000000000000000000000000000000000000';

// ============================================
// COMMUNICATION SERVICES
// ============================================

// SLACK-001: Slack Bot Token
const SLACK_BOT_TOKEN = 'xoxb-FAKE-FAKE-FAKE-abcdefghijklmnopqrstuv';

// SLACK-002: Slack User Token
const slackUserToken = 'xoxp-FAKE-FAKE-FAKE-FAKE-abcdefghijklmnopqrstuvwxyz';

// SLACK-003: Slack Webhook URL
const webhookUrl = 'https://hooks.example.com/services/TXXXXXXXX/BXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX';

// TWILIO-001: Twilio API Key
const TWILIO_API_KEY = 'SKFAKE000000000000000000000000000';

// SG-001: SendGrid API Key
const SENDGRID_API_KEY = 'SG.xxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// ============================================
// AI/ML API KEYS
// ============================================

// OAI-001: OpenAI API Key
const OPENAI_API_KEY = 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const openaiKey = 'sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890ab';

// ANT-001: Anthropic API Key
const ANTHROPIC_API_KEY = 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// HF-001: Hugging Face Token
const HF_TOKEN = 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// ============================================
// JWT AND SESSION TOKENS
// ============================================

// JWT-001: JWT Token in code
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// JWT-002: JWT Secret
const JWT_SECRET = 'my-super-secret-jwt-signing-key-12345';

// ============================================
// PRIVATE KEYS
// ============================================

// PK-001: RSA Private Key
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AHB7MAs9PoXKPymj7Iod
FAKE_KEY_CONTENT_FOR_TESTING_PURPOSES_ONLY
-----END RSA PRIVATE KEY-----`;

// PK-003: OpenSSH Private Key
const sshKey = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
FAKE_SSH_KEY_FOR_TESTING
-----END OPENSSH PRIVATE KEY-----`;

// ============================================
// DATABASE CONNECTION STRINGS
// ============================================

// SEC-005: MongoDB connection string with credentials
const MONGO_URI = 'mongodb://admin:password123@cluster0.mongodb.net:27017/production';

// SEC-005: PostgreSQL connection string
const DATABASE_URL = 'postgresql://postgres:secretpassword@db.example.com:5432/myapp';

// SEC-005: Redis connection string
const REDIS_URL = 'redis://default:myredispassword@redis.example.com:6379';

// ============================================
// GENERIC SECRETS
// ============================================

// SEC-001: Generic API key patterns
const config = {
  api_key: 'abcdef1234567890abcdef1234567890',
  apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  API_KEY: 'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy'
};

// SEC-002: Generic secrets
const secrets = {
  secret_key: 'my-application-secret-key-value',
  secretKey: 'another-secret-key-for-testing'
};

// SEC-004: Hardcoded passwords
const adminPassword = 'SuperSecretAdmin123!';
const dbPassword = 'DatabasePassword456';

export {
  awsConfig,
  stripeLiveKey,
  OPENAI_API_KEY,
  authToken,
  config
};
