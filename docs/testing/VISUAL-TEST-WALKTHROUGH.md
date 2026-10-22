# Sayphora — Visual Showcase & Before/After Journeys

> A recruiter-friendly, browser-rendered walkthrough of the Sayphora storefront and staff console. Open this Markdown file on GitHub to see the screenshots inline; click an image to inspect it at full size.

**51 verified screenshot assets** · Desktop and mobile views · Customer journeys and staff workflows  
**Tested source commit:** `7c0cc57a18213e020afa6e0ee8ae0d8a2126808c`  
**Verification run:** [GitHub Actions — typecheck, PostgreSQL tests, browser E2E and Docker build](https://github.com/faizansaiyed123/Sayphora/actions/runs/39720558160) · [Screenshot evidence artifact](https://github.com/faizansaiyed123/Sayphora/actions/runs/39720558160/artifacts/12400484469)

## Showcase contents

- [Storefront and discovery](#storefront-and-discovery)
- [Account, bag and checkout journeys](#account-bag-and-checkout-journeys)
- [Product, reviews and beauty tools](#product-reviews-and-beauty-tools)
- [Loyalty, boutique and device experience](#loyalty-boutique-and-device-experience)
- [Staff console and operations](#staff-console-and-operations)
- [Coverage and verification limits](#coverage-and-verification-limits)

**Reading the comparisons:** “Before” and “After” are reserved for screenshots that reflect a real state transition in the tested flow. Related tools are labelled “Feature view” rather than passed off as a before/after. Each image is linked to its full-size repository asset, and the captions describe the tested state.

---

## Storefront and discovery

### 01 · Browse the catalogue, then refine results

The flow starts with the API-backed catalogue and then applies search, category, price and skin-type refinements, sorting and the editorial layout.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Catalogue</strong></p>
<a href="visuals/01-storefront-catalogue.png"><img src="visuals/01-storefront-catalogue.png" alt="Storefront catalogue" width="100%" /></a>
<p><strong>Storefront catalogue</strong><br/>The storefront displays products from the API. The browser waits for a catalog item, a healthy database and a 12-product API response before this screenshot is saved.<br/><sub>1280 × 720 viewport · <a href="visuals/01-storefront-catalogue.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Refined catalogue</strong></p>
<a href="visuals/22-storefront-refinements.png"><img src="visuals/22-storefront-refinements.png" alt="Catalogue filtering, sorting and editorial view" width="100%" /></a>
<p><strong>Catalogue filtering, sorting and editorial view</strong><br/>The browser search finds the catalog product, then category, price order, skin-type and under-$50 refinements plus the editorial layout are changed and checked.<br/><sub>1280 × 720 viewport · <a href="visuals/22-storefront-refinements.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 02 · Newsletter and currency preference

The display currency changes to EUR and the newsletter form confirms a subscription using a synthetic example.com address.

<table>
<tr>
<td width="100%" valign="top">
<p align="center"><strong>FEATURE SCREEN</strong></p>
<a href="visuals/23-newsletter-currency.png"><img src="visuals/23-newsletter-currency.png" alt="Currency preference and newsletter confirmation" width="100%" /></a>
<p><strong>Currency preference and newsletter confirmation</strong><br/>The display currency changes to EUR and the newsletter form confirms a subscription using a synthetic example.com address.<br/><sub>1280 × 720 viewport · <a href="visuals/23-newsletter-currency.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
## Account, bag and checkout journeys

### 03 · Registration completes

A completed synthetic registration form transitions to the authenticated shopping experience.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Registration form</strong></p>
<a href="visuals/02-registration-form.png"><img src="visuals/02-registration-form.png" alt="Registration form" width="100%" /></a>
<p><strong>Registration form</strong><br/>A complete customer form is shown before submission. The email uses the reserved example.com domain and cannot deliver mail to a real person.<br/><sub>1280 × 720 viewport · <a href="visuals/02-registration-form.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Account created</strong></p>
<a href="visuals/03-registration-success.png"><img src="visuals/03-registration-success.png" alt="Account created" width="100%" /></a>
<p><strong>Account created</strong><br/>The registration flow returns to the authenticated shopping experience after the UI confirms success.<br/><sub>1280 × 720 viewport · <a href="visuals/03-registration-success.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 04 · Apply a promotion to the bag

The bag displays a selected catalogue item, then shows the server-accepted SAYPHORA20 promotion.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Bag</strong></p>
<a href="visuals/04-shopping-bag.png"><img src="visuals/04-shopping-bag.png" alt="Product added to the bag" width="100%" /></a>
<p><strong>Product added to the bag</strong><br/>The cart drawer is open and the checkout action is available after selecting a product from the seeded catalog.<br/><sub>1280 × 720 viewport · <a href="visuals/04-shopping-bag.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Promotion accepted</strong></p>
<a href="visuals/05-promotion-applied.png"><img src="visuals/05-promotion-applied.png" alt="Promotion accepted" width="100%" /></a>
<p><strong>Promotion accepted</strong><br/>The server accepts SAYPHORA20 and the cart displays the applied promotion before checkout continues.<br/><sub>1280 × 720 viewport · <a href="visuals/05-promotion-applied.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 05 · Bag controls and empty state

The bag contains two foundation units, complimentary samples and a promotion; after item removal and promotion removal, the explicit empty state is shown.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Items, samples and promo</strong></p>
<a href="visuals/41-cart-samples-promo.png"><img src="visuals/41-cart-samples-promo.png" alt="Cart quantity, samples and promotion" width="100%" /></a>
<p><strong>Cart quantity, samples and promotion</strong><br/>The bag contains two foundation units, two complimentary samples are selected, and the seeded SAYPHORA20 promotion is applied.<br/><sub>1280 × 720 viewport · <a href="visuals/41-cart-samples-promo.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Empty bag</strong></p>
<a href="visuals/42-cart-empty-state.png"><img src="visuals/42-cart-empty-state.png" alt="Empty bag after removing the item" width="100%" /></a>
<p><strong>Empty bag after removing the item</strong><br/>Removing the only cart line leaves the bag in its explicit empty state after the active promotion is removed.<br/><sub>1280 × 720 viewport · <a href="visuals/42-cart-empty-state.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 06 · Review the order, place it, then track it

The checkout review leads to an API-issued order number and then an order-progress timeline. Server-side order persistence and pricing are separately asserted by the test suite.

<table>
<tr>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>STEP 1 · CHECKOUT REVIEW</strong></p>
<a href="visuals/06-checkout-review.png"><img src="visuals/06-checkout-review.png" alt="Checkout review" width="100%" /></a>
<p><strong>Checkout review</strong><br/>Valid shipping details reach the review step. The supported pay-on-delivery option is present before the order is submitted.<br/><sub>1280 × 720 viewport · <a href="visuals/06-checkout-review.png">Open full-size image</a></sub></p>
</td>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>STEP 2 · ORDER CREATED</strong></p>
<a href="visuals/07-order-confirmation.png"><img src="visuals/07-order-confirmation.png" alt="Order confirmation" width="100%" /></a>
<p><strong>Order confirmation</strong><br/>The application displays a server-issued order number. The saved order, ownership, items, loyalty points, status and server-calculated total are verified through the API.<br/><sub>1280 × 720 viewport · <a href="visuals/07-order-confirmation.png">Open full-size image</a></sub></p>
</td>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>STEP 3 · ORDER TRACKING</strong></p>
<a href="visuals/08-order-tracking.png"><img src="visuals/08-order-tracking.png" alt="Order tracking" width="100%" /></a>
<p><strong>Order tracking</strong><br/>The tracking dialog displays the same order number returned by the API and a visible order-progress timeline.<br/><sub>1280 × 720 viewport · <a href="visuals/08-order-tracking.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 07 · Configure a gift, then review it

The shipping step configures express delivery, address saving, gift packaging and a message before showing the resulting review.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Shipping and gift choices</strong></p>
<a href="visuals/26-checkout-gift-options.png"><img src="visuals/26-checkout-gift-options.png" alt="Express delivery and gift options" width="100%" /></a>
<p><strong>Express delivery and gift options</strong><br/>The shipping step selects express delivery, enables address saving, and configures a gift box and message before reviewing the order.<br/><sub>1280 × 720 viewport · <a href="visuals/26-checkout-gift-options.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Checkout review</strong></p>
<a href="visuals/27-checkout-gift-review.png"><img src="visuals/27-checkout-gift-review.png" alt="Checkout review with gift packaging" width="100%" /></a>
<p><strong>Checkout review with gift packaging</strong><br/>The review step displays pay-on-delivery, the selected gift presentation and the current server-pricing summary before order placement.<br/><sub>1280 × 720 viewport · <a href="visuals/27-checkout-gift-review.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
## Product, reviews and beauty tools

### 08 · From product detail to verified customer feedback

The product view leads into verified-purchase feedback. A separate signed-in customer can filter to verified buyers and mark a review helpful.

<table>
<tr>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>STEP 1 · PRODUCT DETAILS</strong></p>
<a href="visuals/09-product-detail.png"><img src="visuals/09-product-detail.png" alt="Product details" width="100%" /></a>
<p><strong>Product details</strong><br/>The product detail view is opened for an item returned by the catalog API, and its review entry point is visible before continuing.<br/><sub>1280 × 720 viewport · <a href="visuals/09-product-detail.png">Open full-size image</a></sub></p>
</td>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>STEP 2 · VERIFIED-PURCHASE REVIEW</strong></p>
<a href="visuals/10-verified-product-review.png"><img src="visuals/10-verified-product-review.png" alt="Verified purchase review" width="100%" /></a>
<p><strong>Verified purchase review</strong><br/>The review confirmation is visible. The API independently verifies the review title and verified-purchase flag for the account that placed the order.<br/><sub>1280 × 720 viewport · <a href="visuals/10-verified-product-review.png">Open full-size image</a></sub></p>
</td>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>STEP 3 · REVIEW FILTER AND VOTE</strong></p>
<a href="visuals/44-review-vote-filter.png"><img src="visuals/44-review-vote-filter.png" alt="Verified review filter and helpful voting" width="100%" /></a>
<p><strong>Verified review filter and helpful voting</strong><br/>A second signed-in customer marks another customer’s verified-purchase review helpful and filters the list to verified buyers.<br/><sub>1280 × 720 viewport · <a href="visuals/44-review-vote-filter.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 09 · Virtual try-on connects to the bag

The selected foundation finish is changed in the mirror, then the same seeded product is added to the shopping bag.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Try-on studio</strong></p>
<a href="visuals/15-virtual-try-on.png"><img src="visuals/15-virtual-try-on.png" alt="Virtual try-on studio" width="100%" /></a>
<p><strong>Virtual try-on studio</strong><br/>The virtual mirror opens for a real foundation from the seeded catalog. The finish control is changed before the screenshot is captured.<br/><sub>1280 × 720 viewport · <a href="visuals/15-virtual-try-on.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Shade in bag</strong></p>
<a href="visuals/16-vto-shade-added-to-bag.png"><img src="visuals/16-vto-shade-added-to-bag.png" alt="Try-on shade added to the bag" width="100%" /></a>
<p><strong>Try-on shade added to the bag</strong><br/>After adding the selected finish, the shopping bag opens with the same seeded foundation. This confirms the mirror action reaches the cart drawer.<br/><sub>1280 × 720 viewport · <a href="visuals/16-vto-shade-added-to-bag.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 10 · Product decision tools

Two product-detail tools are shown side by side: attribute comparison and full-screen image inspection. These are companion features, not a before/after transition.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Comparison</strong></p>
<a href="visuals/14-product-comparison.png"><img src="visuals/14-product-comparison.png" alt="Side-by-side product comparison" width="100%" /></a>
<p><strong>Side-by-side product comparison</strong><br/>Two seeded catalog products appear together in the comparison matrix, with customer rating, finish, coverage and skin-type attributes.<br/><sub>1280 × 720 viewport · <a href="visuals/14-product-comparison.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Image inspection</strong></p>
<a href="visuals/24-product-gallery-lightbox.png"><img src="visuals/24-product-gallery-lightbox.png" alt="Product image lightbox" width="100%" /></a>
<p><strong>Product image lightbox</strong><br/>The product image opens in the full-screen inspection lightbox and exposes its dedicated close control.<br/><sub>1280 × 720 viewport · <a href="visuals/24-product-gallery-lightbox.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 11 · Ingredient diagnostics and shade matching

Ingredient information sits alongside a deterministic catalogue-backed shade match. The shade matcher screenshot is not evidence of live external AI generation.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Ingredients</strong></p>
<a href="visuals/17-ingredient-diagnostics.png"><img src="visuals/17-ingredient-diagnostics.png" alt="Ingredient safety diagnostic" width="100%" /></a>
<p><strong>Ingredient safety diagnostic</strong><br/>The product diagnostic displays its standard, pore-clog index, formula pH and ingredient safety information for the selected catalog product.<br/><sub>1280 × 720 viewport · <a href="visuals/17-ingredient-diagnostics.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Shade match</strong></p>
<a href="visuals/18-shade-match.png"><img src="visuals/18-shade-match.png" alt="Personalised shade match" width="100%" /></a>
<p><strong>Personalised shade match</strong><br/>The deterministic catalog-backed matcher returns an in-stock shade for the selected medium depth and warm undertone; this is not a live Gemini-provider test.<br/><sub>1280 × 720 viewport · <a href="visuals/18-shade-match.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 12 · Routine builder and beauty concierge

The routine builder separates AM and PM steps; the concierge response uses the configured catalogue-backed response/fallback path.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · AM/PM routine</strong></p>
<a href="visuals/19-skincare-routine.png"><img src="visuals/19-skincare-routine.png" alt="Morning and evening routine" width="100%" /></a>
<p><strong>Morning and evening routine</strong><br/>The deterministic routine builder recommends real catalog products in separate AM and PM steps. Live external AI generation remains a separate integration check.<br/><sub>1280 × 720 viewport · <a href="visuals/19-skincare-routine.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Concierge</strong></p>
<a href="visuals/30-ai-concierge.png"><img src="visuals/30-ai-concierge.png" alt="Concierge product recommendation" width="100%" /></a>
<p><strong>Concierge product recommendation</strong><br/>A visitor asks the concierge for hydration help and receives a recommendation tied to a product in the seeded catalogue. CI uses the configured fallback when no live Gemini credential is supplied.<br/><sub>1280 × 720 viewport · <a href="visuals/30-ai-concierge.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 13 · Product bundle and sizing/application routine

The bundle builder displays selected companion products and a saving. The product-detail state shows the 75 mL option, quantity two, calculated total and product-specific application-routine tab.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Bundle builder</strong></p>
<a href="visuals/25-product-bundle-builder.png"><img src="visuals/25-product-bundle-builder.png" alt="Curated product bundle" width="100%" /></a>
<p><strong>Curated product bundle</strong><br/>The frequently-paired product builder shows the selected companions and its 15% bundle saving before the bundle is added.<br/><sub>1280 × 720 viewport · <a href="visuals/25-product-bundle-builder.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Size and routine</strong></p>
<a href="visuals/43-product-size-and-ritual.png"><img src="visuals/43-product-size-and-ritual.png" alt="Product size, quantity and application routine" width="100%" /></a>
<p><strong>Product size, quantity and application routine</strong><br/>The 75 mL option and quantity two are selected, the add-to-bag total reflects $144, and the product-specific application-routine tab is opened.<br/><sub>1280 × 720 viewport · <a href="visuals/43-product-size-and-ritual.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
## Loyalty, boutique and device experience

### 14 · Redeem a loyalty reward

The member sees their balance and an eligible reward, then receives a single-use redemption code with a verified point-balance update.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Rewards available</strong></p>
<a href="visuals/28-loyalty-bazaar.png"><img src="visuals/28-loyalty-bazaar.png" alt="Member rewards bazaar" width="100%" /></a>
<p><strong>Member rewards bazaar</strong><br/>An authenticated member sees the balance and a redeemable reward after an order has earned enough points.<br/><sub>1280 × 720 viewport · <a href="visuals/28-loyalty-bazaar.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Reward code issued</strong></p>
<a href="visuals/29-loyalty-redemption.png"><img src="visuals/29-loyalty-redemption.png" alt="Reward code issued" width="100%" /></a>
<p><strong>Reward code issued</strong><br/>Redeeming the reward produces a customer-visible single-use code and updates the member’s available points.<br/><sub>1280 × 720 viewport · <a href="visuals/29-loyalty-redemption.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 15 · Select a preferred boutique

The selected location is visibly marked in the locator. This test uses the seeded directory/fallback rather than live Maps grounding.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Boutique directory</strong></p>
<a href="visuals/20-boutique-directory.png"><img src="visuals/20-boutique-directory.png" alt="Boutique directory" width="100%" /></a>
<p><strong>Boutique directory</strong><br/>The locator displays the seeded boutique directory using the built-in fallback path; no GPS permission is requested.<br/><sub>1280 × 720 viewport · <a href="visuals/20-boutique-directory.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Pickup location selected</strong></p>
<a href="visuals/21-pickup-store-selected.png"><img src="visuals/21-pickup-store-selected.png" alt="Pickup location selected" width="100%" /></a>
<p><strong>Pickup location selected</strong><br/>The selected boutique is visibly marked in the locator after the user chooses it as the preferred pickup location.<br/><sub>1280 × 720 viewport · <a href="visuals/21-pickup-store-selected.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 16 · Offline catalogue and install guidance

The service worker serves cached catalogue content while offline; the iOS capture demonstrates install-help UI, not a physical-device installation.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Offline catalogue</strong></p>
<a href="visuals/31-pwa-offline-catalog.png"><img src="visuals/31-pwa-offline-catalog.png" alt="Cached product catalogue while offline" width="100%" /></a>
<p><strong>Cached product catalogue while offline</strong><br/>The production web app exposes a standalone manifest and registered service worker; after the public catalogue is cached, the browser retrieves its twelve products while network access is disabled.<br/><sub>1280 × 720 viewport · <a href="visuals/31-pwa-offline-catalog.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · iOS install help</strong></p>
<a href="visuals/47-ios-install-guide.png"><img src="visuals/47-ios-install-guide.png" alt="iOS add-to-home-screen instructions" width="100%" /></a>
<p><strong>iOS add-to-home-screen instructions</strong><br/>An iPhone Safari-like user-agent triggers the iOS install guidance modal. This validates the guidance UI, not a physical-device installation.<br/><sub>390 × 844 viewport · <a href="visuals/47-ios-install-guide.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 17 · Responsive mobile navigation and order action

Both screenshots use the 390 × 844 mobile viewport. The customer flow rejects an invalid order lookup, finds the signed-in customer’s own order and confirms its persisted cancellation.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Mobile navigation</strong></p>
<a href="visuals/46-mobile-navigation.png"><img src="visuals/46-mobile-navigation.png" alt="Mobile navigation drawer" width="100%" /></a>
<p><strong>Mobile navigation drawer</strong><br/>At 390 × 844, the compact navigation exposes category selection plus the loyalty, boutique and order-tracking entry points.<br/><sub>390 × 844 viewport · <a href="visuals/46-mobile-navigation.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Order cancellation</strong></p>
<a href="visuals/45-customer-order-cancelled.png"><img src="visuals/45-customer-order-cancelled.png" alt="Order lookup and eligible cancellation" width="100%" /></a>
<p><strong>Order lookup and eligible cancellation</strong><br/>An invalid order number is rejected, the customer’s own order is found, its progress is shown, and cancellation is confirmed by the persisted Cancelled status.<br/><sub>390 × 844 viewport · <a href="visuals/45-customer-order-cancelled.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
## Staff console and operations

### 18 · Staff overview and service diagnostics

The protected staff console provides an operations overview and a separate diagnostics view for AI, Maps and PWA controls.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Staff overview</strong></p>
<a href="visuals/32-admin-overview.png"><img src="visuals/32-admin-overview.png" alt="Staff executive overview" width="100%" /></a>
<p><strong>Staff executive overview</strong><br/>The seeded administrator enters the protected operations console and sees its analytics overview.<br/><sub>1280 × 720 viewport · <a href="visuals/32-admin-overview.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · AI/Maps/PWA diagnostics</strong></p>
<a href="visuals/39-admin-ai-maps-pwa.png"><img src="visuals/39-admin-ai-maps-pwa.png" alt="AI, Maps and PWA diagnostics" width="100%" /></a>
<p><strong>AI, Maps and PWA diagnostics</strong><br/>The admin diagnostics page shows AI usage counters, the boutique directory, Google Maps grounding area and the service-worker cache controls.<br/><sub>1280 × 720 viewport · <a href="visuals/39-admin-ai-maps-pwa.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 19 · Create and publish a product

The staff user submits a temporary test product; it appears in inventory after the server accepts it.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Product form</strong></p>
<a href="visuals/34-admin-product-create-form.png"><img src="visuals/34-admin-product-create-form.png" alt="New product form" width="100%" /></a>
<p><strong>New product form</strong><br/>The product-creation form exposes the fields used to publish a catalog item; this visual check does not submit test merchandise.<br/><sub>1280 × 720 viewport · <a href="visuals/34-admin-product-create-form.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Product created</strong></p>
<a href="visuals/48-admin-product-created.png"><img src="visuals/48-admin-product-created.png" alt="Product successfully published" width="100%" /></a>
<p><strong>Product successfully published</strong><br/>The staff user submits the product form and the new test product appears in the inventory table after the server accepts it.<br/><sub>1280 × 720 viewport · <a href="visuals/48-admin-product-created.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 20 · Update stock and apply the low-stock filter

The stock editor persists three units, and the low-stock filter still finds the item after the table reloads.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Inventory table</strong></p>
<a href="visuals/33-admin-product-catalog.png"><img src="visuals/33-admin-product-catalog.png" alt="Product inventory and stock controls" width="100%" /></a>
<p><strong>Product inventory and stock controls</strong><br/>The product tab exposes catalog search, category and stock filters, inventory editing, ratings and archive actions.<br/><sub>1280 × 720 viewport · <a href="visuals/33-admin-product-catalog.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Stock persisted and filtered</strong></p>
<a href="visuals/49-admin-low-stock-update.png"><img src="visuals/49-admin-low-stock-update.png" alt="Inventory updated and low-stock filtered" width="100%" /></a>
<p><strong>Inventory updated and low-stock filtered</strong><br/>The stock editor persists three units; the low-stock filter still finds the item after the table reloads from server data.<br/><sub>1280 × 720 viewport · <a href="visuals/49-admin-low-stock-update.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 21 · Staff order management and review moderation

Related areas of the staff console: the order queue, status and tracking controls, plus review verification and moderation actions.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Order management</strong></p>
<a href="visuals/35-admin-order-management.png"><img src="visuals/35-admin-order-management.png" alt="Order queue and fulfilment controls" width="100%" /></a>
<p><strong>Order queue and fulfilment controls</strong><br/>The staff orders tab exposes order search, status filtering, tracking-code entry and guarded fulfillment transitions.<br/><sub>1280 × 720 viewport · <a href="visuals/35-admin-order-management.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>FEATURE VIEW · Review moderation</strong></p>
<a href="visuals/36-admin-review-moderation.png"><img src="visuals/36-admin-review-moderation.png" alt="Customer review moderation" width="100%" /></a>
<p><strong>Customer review moderation</strong><br/>The protected review console lists customer feedback, verified-buyer markers and moderation actions.<br/><sub>1280 × 720 viewport · <a href="visuals/36-admin-review-moderation.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 22 · Fulfil an order

The UI and API confirm the persisted Processing → Packed status transition and event history.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Order in queue</strong></p>
<a href="visuals/11-admin-order-before-update.png"><img src="visuals/11-admin-order-before-update.png" alt="Staff order queue" width="100%" /></a>
<p><strong>Staff order queue</strong><br/>After staff authentication, the fulfillment queue displays the order before a status transition is requested.<br/><sub>1280 × 720 viewport · <a href="visuals/11-admin-order-before-update.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Order marked Packed</strong></p>
<a href="visuals/12-admin-order-updated.png"><img src="visuals/12-admin-order-updated.png" alt="Order marked Packed" width="100%" /></a>
<p><strong>Order marked Packed</strong><br/>The UI confirms the change, and the API confirms the persisted Packed status and the Processing → Packed event history.<br/><sub>1280 × 720 viewport · <a href="visuals/12-admin-order-updated.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 23 · Manage a promotion from list to paused campaign

The administrator moves from the campaign list to the creation form, creates a temporary promotion, and pauses it. The last two captures show the active campaign and its disabled state.

<table>
<tr>
<td width="25%" valign="top">
<p align="center"><strong>STEP 1 · PROMOTION LIST</strong></p>
<a href="visuals/37-admin-promotion-management.png"><img src="visuals/37-admin-promotion-management.png" alt="Promotion code administration" width="100%" /></a>
<p><strong>Promotion code administration</strong><br/>The promotion tab displays active campaigns and redemption counts with controls to create, activate, deactivate and remove codes.<br/><sub>1280 × 720 viewport · <a href="visuals/37-admin-promotion-management.png">Open full-size image</a></sub></p>
</td>
<td width="25%" valign="top">
<p align="center"><strong>STEP 2 · CREATE FORM</strong></p>
<a href="visuals/38-admin-promo-create-form.png"><img src="visuals/38-admin-promo-create-form.png" alt="New promotion form" width="100%" /></a>
<p><strong>New promotion form</strong><br/>The promotion form exposes code, discount type, value and description fields. No promotion is created in this visual-only check.<br/><sub>1280 × 720 viewport · <a href="visuals/38-admin-promo-create-form.png">Open full-size image</a></sub></p>
</td>
<td width="25%" valign="top">
<p align="center"><strong>STEP 3 · CAMPAIGN CREATED</strong></p>
<a href="visuals/50-admin-promo-created.png"><img src="visuals/50-admin-promo-created.png" alt="Promotion created from the staff console" width="100%" /></a>
<p><strong>Promotion created from the staff console</strong><br/>The administrator creates a temporary campaign in the browser and the new active promotion is shown in the persisted promo list.<br/><sub>1280 × 720 viewport · <a href="visuals/50-admin-promo-created.png">Open full-size image</a></sub></p>
</td>
<td width="25%" valign="top">
<p align="center"><strong>STEP 4 · CAMPAIGN PAUSED</strong></p>
<a href="visuals/51-admin-promo-paused.png"><img src="visuals/51-admin-promo-paused.png" alt="Promotion pause state" width="100%" /></a>
<p><strong>Promotion pause state</strong><br/>The administrator pauses the newly created code and the UI reflects its disabled state after the server update.<br/><sub>1280 × 720 viewport · <a href="visuals/51-admin-promo-paused.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
### 24 · Save a wishlist, then share it

The saved item is visible in the wishlist and the share action confirms the storefront link.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · Saved wishlist</strong></p>
<a href="visuals/13-saved-wishlist.png"><img src="visuals/13-saved-wishlist.png" alt="Saved wishlist" width="100%" /></a>
<p><strong>Saved wishlist</strong><br/>A real seeded catalog product has been saved, and the wishlist drawer displays the selected item before any bag action.<br/><sub>1280 × 720 viewport · <a href="visuals/13-saved-wishlist.png">Open full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · Share action confirmed</strong></p>
<a href="visuals/40-wishlist-share-link.png"><img src="visuals/40-wishlist-share-link.png" alt="Shareable wishlist link" width="100%" /></a>
<p><strong>Shareable wishlist link</strong><br/>The share action copies the storefront link when clipboard access is available and confirms the action in the wishlist UI.<br/><sub>1280 × 720 viewport · <a href="visuals/40-wishlist-share-link.png">Open full-size image</a></sub></p>
</td>
</tr>
</table>
## Coverage and verification limits

### Feature coverage represented in the visual evidence

- **Storefront and discovery:** API-backed catalogue, search/refinements, sorting, newsletter confirmation and currency display preference.
- **Product experiences:** details, image inspection, comparison, size/quantity, bundle builder, virtual try-on, ingredient diagnostics, shade matching and AM/PM routines.
- **Bag and ordering:** promotion/sample controls, empty bag, checkout gift options, order creation/tracking and eligible cancellation.
- **Accounts and community:** registration, verified-purchase reviews, review filtering/helpful voting, wishlist and sharing.
- **Retention and personalisation:** loyalty redemption, concierge fallback, boutique selection.
- **Staff operations:** product creation, inventory/low-stock, order fulfilment, review moderation and promotion creation/pausing.
- **PWA/mobile:** offline catalogue, mobile navigation and iOS install-help UI.

### Boundaries — not represented as live-production proof

- Browser tests run the production build locally against disposable PostgreSQL and synthetic test accounts/addresses. This is not a deployed-domain acceptance test.
- Gemini checks exercise the deterministic fallback without a live credential. Real provider requests, quotas, failures and response quality with a live key remain unverified.
- Boutique tests use the seeded directory/fallback. Live Google Maps grounding, external place/review data and real GPS permission behavior remain unverified.
- Newsletter and password-reset contracts are exercised, but actual SMTP delivery/inbox receipt is not verified.
- Checkout supports **pay on delivery**; no live card gateway or settlement flow is available to test.
- Tracking screens and staff-assigned tracking details are checked; carrier APIs, shipment webhooks and carrier-confirmed delivery events are not verified.
- Service-worker/offline behavior and simulated iOS install guidance are tested. Actual iOS/Android installation on physical devices and push notifications are not verified.
- CI builds the Docker image but does not validate the deployed Docker Compose environment, production TLS/cookie configuration, production-domain sessions or backup/recovery procedures.

---

**Evidence standard:** Screenshots are added only after the corresponding browser assertions succeed. API tests separately cover persistence, ownership, validation, pricing and state transitions where exercised. External-service, device and production-deployment behavior is called out above rather than marked as passed.

**Complete screenshot inventory:** [Visual assets folder](https://github.com/faizansaiyed123/Sayphora/tree/main/docs/testing/visuals) · [Machine-readable manifest](https://github.com/faizansaiyed123/Sayphora/blob/main/docs/testing/visuals/manifest.json).
