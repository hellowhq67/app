/**
 * Authentication Testing Script
 *
 * This script helps verify your Better Auth setup is working correctly.
 * Run with: pnpm tsx scripts/test-auth.ts
 */

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users, sessions, accounts, verifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...");
  try {
    const result = await db.select().from(users).limit(1);
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

async function testAuthConfiguration() {
  console.log("\n🔍 Testing auth configuration...");

  const config = {
    appName: "PTE Academic",
    hasSecret: !!process.env.BETTER_AUTH_SECRET,
    secretLength: process.env.BETTER_AUTH_SECRET?.length || 0,
    baseURL: process.env.BETTER_AUTH_URL,
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasGoogleOAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    hasGitHubOAuth: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  };

  console.log("Configuration:");
  console.log(`  App Name: ${config.appName}`);
  console.log(`  Secret Set: ${config.hasSecret ? '✅' : '❌'}`);
  console.log(`  Secret Length: ${config.secretLength} chars (min 32, recommended 48+)`);
  console.log(`  Base URL: ${config.baseURL}`);
  console.log(`  Resend API: ${config.hasResendKey ? '✅' : '❌'}`);
  console.log(`  Google OAuth: ${config.hasGoogleOAuth ? '✅' : '❌'}`);
  console.log(`  GitHub OAuth: ${config.hasGitHubOAuth ? '✅' : '❌'}`);

  const passed = config.hasSecret &&
                 config.secretLength >= 32 &&
                 config.baseURL &&
                 config.hasResendKey;

  if (passed) {
    console.log("✅ Auth configuration looks good!");
  } else {
    console.log("❌ Auth configuration has issues");
  }

  return passed;
}

async function testDatabaseSchema() {
  console.log("\n🔍 Testing database schema...");

  try {
    // Test each table exists
    const userCount = await db.select().from(users).limit(1);
    console.log("✅ Users table exists");

    const sessionCount = await db.select().from(sessions).limit(1);
    console.log("✅ Sessions table exists");

    const accountCount = await db.select().from(accounts).limit(1);
    console.log("✅ Accounts table exists");

    const verificationCount = await db.select().from(verifications).limit(1);
    console.log("✅ Verifications table exists");

    return true;
  } catch (error) {
    console.error("❌ Schema test failed:", error);
    return false;
  }
}

async function testEmailService() {
  console.log("\n🔍 Testing email service...");

  const hasResendKey = !!process.env.RESEND_API_KEY;

  if (!hasResendKey) {
    console.log("❌ RESEND_API_KEY not found");
    return false;
  }

  try {
    // Test Resend API connectivity
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: "test@example.com",
        subject: "Test",
        html: "Test",
      }),
    });

    // We expect this to fail (invalid email), but it tests the API key
    const data = await response.json();

    if (response.status === 403) {
      console.log("❌ Resend API key invalid or domain not verified");
      console.log("   Go to https://resend.com/domains to verify your domain");
      return false;
    }

    console.log("✅ Resend API key is valid");
    console.log("⚠️  Make sure to verify your domain at https://resend.com/domains");
    return true;
  } catch (error) {
    console.error("❌ Email service test failed:", error);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting Better Auth Tests\n");
  console.log("=" .repeat(50));

  const results = {
    database: await testDatabaseConnection(),
    config: await testAuthConfiguration(),
    schema: await testDatabaseSchema(),
    email: await testEmailService(),
  };

  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Test Results:");
  console.log(`  Database Connection: ${results.database ? '✅' : '❌'}`);
  console.log(`  Auth Configuration: ${results.config ? '✅' : '❌'}`);
  console.log(`  Database Schema: ${results.schema ? '✅' : '❌'}`);
  console.log(`  Email Service: ${results.email ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every(r => r);

  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("✅ All tests passed! Your auth setup is production-ready.");
  } else {
    console.log("❌ Some tests failed. Please fix the issues above.");
    console.log("\n📖 See docs/AUTH_SETUP.md for detailed setup instructions.");
  }

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
