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
    await compareButtons.first().click();
    await expect(page.getByText('Formula Comparison Matrix')).toBeVisible();

    // Selecting one item opens the comparison modal. Close it to select the next product card.
    await page.locator('div.fixed.inset-0 button').nth(1).click();
    const nextCompareButton = page.locator('button[title="Compare formula"]').first();
    await nextCompareButton.hover();
    await nextCompareButton.click();

    await expect(page.getByText('Products (2/4)')).toBeVisible();
    await expect(page.getByText('Customer Rating', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('Finish & Coverage', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('Best For Skin Types', { exact: true }).last()).toBeVisible();
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
  test('product details provide virtual try-on and ingredient diagnostics', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: "Pro Filt'r Soft Matte Longwear Liquid Foundation" }).first().click();

    await expect(page.getByRole('button', { name: 'Virtual Try-On', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Virtual Try-On', exact: true }).click();
    await expect(page.getByText('Live Virtual Mirror', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Glossy', exact: true }).click();
    await page.getByRole('button', { name: /Add Tested Shade to Bag/ }).click();
    await expect(page.getByText('Live Virtual Mirror', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Shopping Bag', exact: true })).toBeVisible();
    await expect(page.getByText("Pro Filt'r Soft Matte Longwear Liquid Foundation").last()).toBeVisible();
    await page.getByRole('button', { name: 'Close bag' }).click();
    await expect(page.getByRole('button', { name: 'Virtual Try-On', exact: true }).last()).toBeVisible();
    await page.getByRole('button', { name: 'Decode Actives', exact: true }).last().click();
    await expect(page.getByText('Clean & Clinical Ingredient Diagnostic')).toBeVisible();
    await expect(page.getByText('Pore Clog Index', { exact: true })).toBeVisible();
    await expect(page.getByText('Formula pH', { exact: true })).toBeVisible();
    await expect(page.getByText('Key Bio-Actives & Safety Ratings')).toBeVisible();
  });

  test('Beauty Insider explains membership to a visitor without leaking account data', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Beauty Insider Rewards/ }).first().click();

    await expect(page.getByRole('heading', { name: 'Beauty Insider Club' })).toBeVisible();
    await expect(page.getByText('How membership works', { exact: true })).toBeVisible();
    await expect(page.getByText('Sign in to see your balance and redeem rewards.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Join for Free & Get 50 Bonus Points' })).toBeVisible();
  });

  test('offline and reconnect notices reflect browser connectivity', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Showing')).toBeVisible();

    await page.context().setOffline(true);
    await expect(page.getByLabel('Offline mode notification')).toBeVisible();
    await expect(page.getByText('Offline Mode Active')).toBeVisible();

    await page.context().setOffline(false);
    await expect(page.getByLabel('Network status notification')).toBeVisible();
    await expect(page.getByText('Connection Restored')).toBeVisible();
  });

});
