import { test, expect } from '@playwright/test';

test.describe('additional customer feature journeys', () => {
  test('catalogue search opens the matching product detail', async ({ page }) => {
    await page.goto('/');

    const search = page.getByPlaceholder('Search products, brands, ingredients, shades... (Press /)');
    await search.fill('Tatcha');
    await expect(page.getByText('Product Matches')).toBeVisible();
    const match = page.getByRole('button', { name: /The Water Cream Pore-Refining Hydrating Moisturizer/ }).first();
    await expect(match).toBeVisible();
    await match.click();

    await expect(page.getByRole('button', { name: 'Close details' })).toBeVisible();
    await expect(page.getByText('The Water Cream Pore-Refining Hydrating Moisturizer').last()).toBeVisible();
  });

  test('wishlist add, remove and empty states work from the storefront', async ({ page }) => {
    await page.goto('/');

    const addButtons = page.locator('button[aria-label="Add to wishlist"]');
    await expect(addButtons.first()).toBeVisible();
    await addButtons.first().click();

    await page.locator('button[title="View Saved Wishlist"]').click();
    const removeButton = page.locator('button[title="Remove from wishlist"]');
    await expect(removeButton).toHaveCount(1);
    await removeButton.click();
    await expect(page.getByText('Your wishlist is empty')).toBeVisible();
  });

  test('product comparison shows side-by-side formulation attributes', async ({ page }) => {
    await page.goto('/');

    const compareButtons = page.locator('button[title="Compare formula"]');
    await compareButtons.first().hover();
    await expect(compareButtons.first()).toBeVisible();
    await compareButtons.first().click();

    const nextCompareButton = page.locator('button[title="Compare formula"]').first();
    await nextCompareButton.hover();
    await nextCompareButton.click();

    const openCompare = page.locator('button[title="Compare Formulations"]');
    await expect(openCompare).toBeVisible();
    await openCompare.click();
    await expect(page.getByText('Customer Rating')).toBeVisible();
    await expect(page.getByText('Finish & Coverage')).toBeVisible();
    await expect(page.getByText('Best For Skin Types')).toBeVisible();
  });

  test('shade matching and skincare regimen use catalogue-backed fallback results', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[title="AI Shade Matcher & Skin Regimen Builder"]').click();

    await expect(page.getByText('Find Your Perfect Complexion Match')).toBeVisible();
    await page.getByRole('button', { name: 'Medium', exact: true }).click();
    await page.getByText('Warm Undertone').click();
    await page.getByRole('button', { name: 'Calculate My Exact Shade Match' }).click();
    await expect(page.getByText(/% match score/)).toBeVisible();

    await page.getByRole('button', { name: /Skincare Regimen Builder/ }).click();
    await expect(page.getByText('Custom AI Skincare Regimen')).toBeVisible();
    await page.getByRole('button', { name: 'Generate My Custom Regimen' }).click();
    await expect(page.getByText('Morning (AM) Regimen')).toBeVisible();
    await expect(page.getByText('Evening (PM) Regimen')).toBeVisible();
  });

  test('store locator returns directory results and lets a visitor select a pickup store', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[title="Google Maps Store Locator & Ateliers"]').click();

    await expect(page.getByPlaceholder('Search city, address, zip code, or beauty boutique name...')).toBeVisible();
    await page.getByRole('button', { name: 'Search Boutiques' }).click();
    await expect(page.getByText('Open in Google Maps').first()).toBeVisible();

    await page.getByRole('button', { name: 'Set Pickup Store' }).first().click();
    await expect(page.getByText('Selected Store').first()).toBeVisible();
  });
});
