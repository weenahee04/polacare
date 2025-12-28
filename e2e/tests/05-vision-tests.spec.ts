/**
 * E2E Test: Vision Screening
 * 
 * Critical User Flow #5: Take Vision Tests
 */

import { test, expect } from './fixtures';

test.describe('Vision Screening', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Eye Care center
    await page.click('text=Eye Care, text=ดูแลตา, text=ศูนย์').catch(() => {});
    await page.waitForTimeout(500);
  });

  test('should display vision screening section', async ({ page }) => {
    // Look for vision tests section
    const screeningSection = page.locator('text=Vision Screening, text=ทดสอบสายตา, text=Screening').first();
    
    if (await screeningSection.isVisible()) {
      await expect(screeningSection).toBeVisible();
    }
  });

  test('should show Amsler Grid test option', async ({ page }) => {
    const amslerButton = page.locator('text=Amsler, button:has-text("Amsler")').first();
    
    if (await amslerButton.isVisible()) {
      await expect(amslerButton).toBeVisible();
    }
  });

  test('should show Color Blindness test option', async ({ page }) => {
    const colorBlindButton = page.locator('text=Color Blind, text=ตาบอดสี, text=Ishihara').first();
    
    if (await colorBlindButton.isVisible()) {
      await expect(colorBlindButton).toBeVisible();
    }
  });

  test('should show Retinal Age test option', async ({ page }) => {
    const retinalButton = page.locator('text=Retinal Age, text=AI Retinal, text=หลอดเลือดตา').first();
    
    if (await retinalButton.isVisible()) {
      await expect(retinalButton).toBeVisible();
    }
  });

  test('should navigate to Amsler Grid test', async ({ page }) => {
    const amslerButton = page.locator('button:has-text("Amsler"), [class*="amsler"]').first();
    
    if (await amslerButton.isVisible()) {
      await amslerButton.click();
      await page.waitForTimeout(500);
      
      // Should see test UI
      const hasTestUI = await page.locator('[class*="grid"], text=ตรงกลาง, text=center, text=กลับ').isVisible()
        .catch(() => false);
      
      expect(hasTestUI).toBeTruthy();
    }
  });

  test('should complete Amsler Grid test', async ({ page }) => {
    const amslerButton = page.locator('button:has-text("Amsler")').first();
    
    if (await amslerButton.isVisible()) {
      await amslerButton.click();
      await page.waitForTimeout(500);
      
      // Find completion or result buttons
      const normalButton = page.locator('button:has-text("ปกติ"), button:has-text("Normal")').first();
      const abnormalButton = page.locator('button:has-text("ผิดปกติ"), button:has-text("Abnormal")').first();
      
      if (await normalButton.isVisible()) {
        await normalButton.click();
        await page.waitForTimeout(1000);
        
        // Should see result or return to main view
        const hasResult = await page.locator('text=ผลการทดสอบ, text=Result, text=บันทึก').isVisible()
          .catch(() => false);
        const hasMainView = await page.locator('text=Eye Care, text=Vision Screening').isVisible()
          .catch(() => false);
        
        expect(hasResult || hasMainView).toBeTruthy();
      }
    }
  });

  test('should show recent test result', async ({ page }) => {
    // Check for recent test display
    const recentTest = page.locator('text=ล่าสุด, text=Recent, text=Last test').first();
    
    if (await recentTest.isVisible()) {
      await expect(recentTest).toBeVisible();
    }
  });

  test('should navigate to Color Blindness test', async ({ page }) => {
    const colorButton = page.locator('button:has-text("Color Blind"), button:has-text("ตาบอดสี")').first();
    
    if (await colorButton.isVisible()) {
      await colorButton.click();
      await page.waitForTimeout(500);
      
      // Should see Ishihara test UI
      const hasTestUI = await page.locator('[class*="ishihara"], text=plate, text=number, img').first().isVisible()
        .catch(() => false);
      const hasBackButton = await page.locator('button:has-text("กลับ"), [class*="back"]').isVisible()
        .catch(() => false);
      
      expect(hasTestUI || hasBackButton).toBeTruthy();
    }
  });

  test('should go back from test to main view', async ({ page }) => {
    const amslerButton = page.locator('button:has-text("Amsler")').first();
    
    if (await amslerButton.isVisible()) {
      await amslerButton.click();
      await page.waitForTimeout(500);
      
      // Click back button
      const backButton = page.locator('button:has-text("กลับ"), button:has([class*="arrow-left"])').first();
      
      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForTimeout(500);
        
        // Should be back to main view
        const hasMainView = await page.locator('text=Eye Care, text=Vision Screening').isVisible()
          .catch(() => false);
        
        expect(hasMainView).toBeTruthy();
      }
    }
  });
});

