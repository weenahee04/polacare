/**
 * E2E Test: Login Flow
 * 
 * Critical User Flow #1: Patient Login
 */

import { test, expect } from './fixtures';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login screen', async ({ page }) => {
    // Check for login form elements
    await expect(page.locator('text=POLACARE')).toBeVisible();
    await expect(page.locator('input[type="tel"], input[placeholder*="เบอร์โทร"]')).toBeVisible();
  });

  test('should show terms link', async ({ page }) => {
    // Look for terms/register link
    const registerLink = page.locator('text=สมัครสมาชิก, text=Register, text=ลงทะเบียน').first();
    await expect(registerLink).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="เบอร์โทร"]');
    
    // Enter invalid phone
    await phoneInput.fill('123');
    
    // Try to submit
    await page.click('button:has-text("OTP"), button[type="submit"]');
    
    // Should show error or not proceed
    await page.waitForTimeout(500);
    
    // Should still be on login screen
    await expect(phoneInput).toBeVisible();
  });

  test('should request OTP for valid phone', async ({ page }) => {
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="เบอร์โทร"]');
    
    // Enter valid phone
    await phoneInput.fill('0899999999');
    
    // Click OTP button
    await page.click('button:has-text("OTP"), button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should either show OTP input or rate limit message
    const hasOtpInput = await page.locator('input[placeholder*="OTP"], input[maxlength="6"]').isVisible();
    const hasRateLimit = await page.locator('text=rate limit, text=ลองใหม่, text=Too many').isVisible();
    
    expect(hasOtpInput || hasRateLimit).toBeTruthy();
  });

  test('should navigate to registration', async ({ page }) => {
    // Click register link
    await page.click('text=สมัครสมาชิก, text=Register');
    
    // Should see terms or registration form
    await page.waitForTimeout(500);
    
    const hasTerms = await page.locator('text=ข้อตกลง, text=Terms, text=เงื่อนไข').isVisible();
    const hasRegForm = await page.locator('input[placeholder*="ชื่อ"], input[name="firstName"]').isVisible();
    
    expect(hasTerms || hasRegForm).toBeTruthy();
  });
});

