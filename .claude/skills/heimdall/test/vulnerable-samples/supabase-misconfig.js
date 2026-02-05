/**
 * TEST FILE: Supabase Misconfiguration
 *
 * This file contains INTENTIONALLY VULNERABLE Supabase code for testing.
 * Based on Escape.tech research: 10.3% of vibe-coded apps have these issues.
 *
 * Expected detections:
 * - SUP-CFG-002: Service role key in client
 * - SUP-CFG-003: SELECT * exposure
 * - SUPA-003: Service role in public env var
 * - BAAS-001: Admin SDK patterns
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// CRITICAL: Service Role Key Exposure
// ============================================

// SUP-CFG-002: Service role key in client code
const supabaseAdmin = createClient(
  'https://xyzproject.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enByb2plY3QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2NzYwMDAwLCJleHAiOjE5MzIzMzYwMDB9.fake_signature_for_testing'
);

// SUP-CFG-002: Explicit service_role reference
const SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key-here';
const adminClient = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

// SUPA-003: Service role in NEXT_PUBLIC (CRITICAL!)
// This would be in .env.local but patterns in code reference it
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  // WRONG: Service role should NEVER be in NEXT_PUBLIC
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
};

// ============================================
// DATA EXPOSURE PATTERNS
// ============================================

// SUP-CFG-003: SELECT * without column restriction
async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');  // Exposes all columns including sensitive ones
  return data;
}

// SUP-CFG-003: Another SELECT * example
async function getProfiles() {
  return await supabase.from('profiles').select('*');
}

// SECURE version (should NOT be flagged as severely)
async function getUsersSecure() {
  const { data } = await supabase
    .from('users')
    .select('id, name, email');  // Only needed columns
  return data;
}

// ============================================
// MISSING AUTH CHECKS
// ============================================

// SUP-CFG-004: Query without auth check
async function deleteUser(userId) {
  // No auth.getUser() check before delete!
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  return !error;
}

// SUP-CFG-006: RPC without auth verification
async function adminAction(data) {
  const { data: result, error } = await supabase
    .rpc('admin_function', { input: data });
  return result;
}

// SECURE version (should show as better practice)
async function deleteUserSecure(userId) {
  // Check authentication first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  return !error;
}

// ============================================
// STORAGE MISCONFIG
// ============================================

// SUP-CFG-005: Public storage bucket
const storageConfig = {
  bucket: 'user-uploads',
  public: true  // All files publicly accessible!
};

async function uploadFile(file) {
  const { data, error } = await supabase.storage
    .from('public-bucket')
    .upload(`files/${file.name}`, file);
  return data;
}

// ============================================
// CLIENT-SIDE ADMIN OPERATIONS
// ============================================

// BAAS-001: Admin SDK pattern in client
const adminSupabase = createServiceClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE  // Service role in client!
);

// Direct database manipulation without validation
async function updateUserRole(userId, newRole) {
  await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);
}

export {
  getAllUsers,
  deleteUser,
  uploadFile,
  updateUserRole
};
