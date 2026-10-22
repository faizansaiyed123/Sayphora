# Sayphora — End-to-End Visual Walkthrough

> Curated evidence from verified browser states. A screenshot is added only after its UI assertion succeeds; failure screenshots and traces are not embedded in this walkthrough.

**Source commit:** 228cf733ac3ee653b61d48b1bc8f640c7cd88877  
**Browser:** Chromium controlled by Playwright  
**Viewport:** Desktop Chrome configuration  
**Data:** Real catalog, stock, price and promotion records from the application seed. The checkout flow uses a generated example.com account and a local, non-shipping order; no real customer account, live email delivery or payment is used.

## How to read this walkthrough

The images follow the user journey from product discovery to order tracking, then show verified reviews and staff fulfilment. The caption under each image explains the action and the check completed before capture. Open an image to view its original resolution.

## Journey coverage

- **Storefront:** 1 screenshot(s)
- **Storefront browsing:** 1 screenshot(s)
- **Storefront communication:** 1 screenshot(s)
- **Product detail tools:** 2 screenshot(s)
- **Checkout options:** 2 screenshot(s)
- **Loyalty rewards:** 2 screenshot(s)
- **AI concierge:** 1 screenshot(s)
- **Offline catalog:** 1 screenshot(s)
- **Admin console:** 1 screenshot(s)
- **Product administration:** 2 screenshot(s)
- **Order management:** 1 screenshot(s)
- **Review moderation:** 1 screenshot(s)
- **Promotion management:** 2 screenshot(s)
- **AI, maps and PWA diagnostics:** 1 screenshot(s)
- **Account creation:** 2 screenshot(s)
- **Shopping bag and promotion:** 2 screenshot(s)
- **Checkout and order tracking:** 3 screenshot(s)
- **Product reviews:** 2 screenshot(s)
- **Order fulfilment:** 2 screenshot(s)
- **Wishlist:** 1 screenshot(s)
- **Product comparison:** 1 screenshot(s)
- **Virtual try-on:** 2 screenshot(s)
- **Ingredient diagnostics:** 1 screenshot(s)
- **Beauty personalisation:** 2 screenshot(s)
- **Boutique locator:** 2 screenshot(s)

## Storefront

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Storefront catalogue</h3>
<a href="visuals/01-storefront-catalogue.png"><img src="visuals/01-storefront-catalogue.png" alt="Storefront catalogue" width="100%"/></a>
<p>The storefront displays products from the API. The browser waits for a catalog item, a healthy database and a 12-product API response before this screenshot is saved.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Storefront browsing

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Catalogue filtering, sorting and editorial view</h3>
<a href="visuals/22-storefront-refinements.png"><img src="visuals/22-storefront-refinements.png" alt="Catalogue filtering, sorting and editorial view" width="100%"/></a>
<p>The browser search finds the catalog product, then category, price order, skin-type and under-$50 refinements plus the editorial layout are changed and checked.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Storefront communication

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Currency preference and newsletter confirmation</h3>
<a href="visuals/23-newsletter-currency.png"><img src="visuals/23-newsletter-currency.png" alt="Currency preference and newsletter confirmation" width="100%"/></a>
<p>The display currency changes to EUR and the newsletter form confirms a subscription using a synthetic example.com address.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Product detail tools

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Product image lightbox</h3>
<a href="visuals/24-product-gallery-lightbox.png"><img src="visuals/24-product-gallery-lightbox.png" alt="Product image lightbox" width="100%"/></a>
<p>The product image opens in the full-screen inspection lightbox and exposes its dedicated close control.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Curated product bundle</h3>
<a href="visuals/25-product-bundle-builder.png"><img src="visuals/25-product-bundle-builder.png" alt="Curated product bundle" width="100%"/></a>
<p>The frequently-paired product builder shows the selected companions and its 15% bundle saving before the bundle is added.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## Checkout options

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Express delivery and gift options</h3>
<a href="visuals/26-checkout-gift-options.png"><img src="visuals/26-checkout-gift-options.png" alt="Express delivery and gift options" width="100%"/></a>
<p>The shipping step selects express delivery, enables address saving, and configures a gift box and message before reviewing the order.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Checkout review with gift packaging</h3>
<a href="visuals/27-checkout-gift-review.png"><img src="visuals/27-checkout-gift-review.png" alt="Checkout review with gift packaging" width="100%"/></a>
<p>The review step displays pay-on-delivery, the selected gift presentation and the current server-pricing summary before order placement.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## Loyalty rewards

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Member rewards bazaar</h3>
<a href="visuals/28-loyalty-bazaar.png"><img src="visuals/28-loyalty-bazaar.png" alt="Member rewards bazaar" width="100%"/></a>
<p>An authenticated member sees the balance and a redeemable reward after an order has earned enough points.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Reward code issued</h3>
<a href="visuals/29-loyalty-redemption.png"><img src="visuals/29-loyalty-redemption.png" alt="Reward code issued" width="100%"/></a>
<p>Redeeming the reward produces a customer-visible single-use code and updates the member’s available points.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## AI concierge

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Concierge product recommendation</h3>
<a href="visuals/30-ai-concierge.png"><img src="visuals/30-ai-concierge.png" alt="Concierge product recommendation" width="100%"/></a>
<p>A visitor asks the concierge for hydration help and receives a recommendation tied to a product in the seeded catalogue. CI uses the configured fallback when no live Gemini credential is supplied.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Offline catalog

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Cached product catalogue while offline</h3>
<a href="visuals/31-pwa-offline-catalog.png"><img src="visuals/31-pwa-offline-catalog.png" alt="Cached product catalogue while offline" width="100%"/></a>
<p>The production web app exposes a standalone manifest and registered service worker; after the public catalogue is cached, the browser retrieves its twelve products while network access is disabled.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Admin console

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Staff executive overview</h3>
<a href="visuals/32-admin-overview.png"><img src="visuals/32-admin-overview.png" alt="Staff executive overview" width="100%"/></a>
<p>The seeded administrator enters the protected operations console and sees its analytics overview.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Product administration

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Product inventory and stock controls</h3>
<a href="visuals/33-admin-product-catalog.png"><img src="visuals/33-admin-product-catalog.png" alt="Product inventory and stock controls" width="100%"/></a>
<p>The product tab exposes catalog search, category and stock filters, inventory editing, ratings and archive actions.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. New product form</h3>
<a href="visuals/34-admin-product-create-form.png"><img src="visuals/34-admin-product-create-form.png" alt="New product form" width="100%"/></a>
<p>The product-creation form exposes the fields used to publish a catalog item; this visual check does not submit test merchandise.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## Order management

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Order queue and fulfilment controls</h3>
<a href="visuals/35-admin-order-management.png"><img src="visuals/35-admin-order-management.png" alt="Order queue and fulfilment controls" width="100%"/></a>
<p>The staff orders tab exposes order search, status filtering, tracking-code entry and guarded fulfillment transitions.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Review moderation

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Customer review moderation</h3>
<a href="visuals/36-admin-review-moderation.png"><img src="visuals/36-admin-review-moderation.png" alt="Customer review moderation" width="100%"/></a>
<p>The protected review console lists customer feedback, verified-buyer markers and moderation actions.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Promotion management

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Promotion code administration</h3>
<a href="visuals/37-admin-promotion-management.png"><img src="visuals/37-admin-promotion-management.png" alt="Promotion code administration" width="100%"/></a>
<p>The promotion tab displays active campaigns and redemption counts with controls to create, activate, deactivate and remove codes.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. New promotion form</h3>
<a href="visuals/38-admin-promo-create-form.png"><img src="visuals/38-admin-promo-create-form.png" alt="New promotion form" width="100%"/></a>
<p>The promotion form exposes code, discount type, value and description fields. No promotion is created in this visual-only check.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## AI, maps and PWA diagnostics

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. AI, Maps and PWA diagnostics</h3>
<a href="visuals/39-admin-ai-maps-pwa.png"><img src="visuals/39-admin-ai-maps-pwa.png" alt="AI, Maps and PWA diagnostics" width="100%"/></a>
<p>The admin diagnostics page shows AI usage counters, the boutique directory, Google Maps grounding area and the service-worker cache controls.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Account creation

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Registration form</h3>
<a href="visuals/02-registration-form.png"><img src="visuals/02-registration-form.png" alt="Registration form" width="100%"/></a>
<p>A complete customer form is shown before submission. The email uses the reserved example.com domain and cannot deliver mail to a real person.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Account created</h3>
<a href="visuals/03-registration-success.png"><img src="visuals/03-registration-success.png" alt="Account created" width="100%"/></a>
<p>The registration flow returns to the authenticated shopping experience after the UI confirms success.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## Shopping bag and promotion

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Product added to the bag</h3>
<a href="visuals/04-shopping-bag.png"><img src="visuals/04-shopping-bag.png" alt="Product added to the bag" width="100%"/></a>
<p>The cart drawer is open and the checkout action is available after selecting a product from the seeded catalog.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Promotion accepted</h3>
<a href="visuals/05-promotion-applied.png"><img src="visuals/05-promotion-applied.png" alt="Promotion accepted" width="100%"/></a>
<p>The server accepts SAYPHORA20 and the cart displays the applied promotion before checkout continues.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## Checkout and order tracking

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Checkout review</h3>
<a href="visuals/06-checkout-review.png"><img src="visuals/06-checkout-review.png" alt="Checkout review" width="100%"/></a>
<p>Valid shipping details reach the review step. The supported pay-on-delivery option is present before the order is submitted.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Order confirmation</h3>
<a href="visuals/07-order-confirmation.png"><img src="visuals/07-order-confirmation.png" alt="Order confirmation" width="100%"/></a>
<p>The application displays a server-issued order number. The saved order, ownership, items, loyalty points, status and server-calculated total are verified through the API.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>03. Order tracking</h3>
<a href="visuals/08-order-tracking.png"><img src="visuals/08-order-tracking.png" alt="Order tracking" width="100%"/></a>
<p>The tracking dialog displays the same order number returned by the API and a visible order-progress timeline.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Product reviews

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Product details</h3>
<a href="visuals/09-product-detail.png"><img src="visuals/09-product-detail.png" alt="Product details" width="100%"/></a>
<p>The product detail view is opened for an item returned by the catalog API, and its review entry point is visible before continuing.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Verified purchase review</h3>
<a href="visuals/10-verified-product-review.png"><img src="visuals/10-verified-product-review.png" alt="Verified purchase review" width="100%"/></a>
<p>The review confirmation is visible. The API independently verifies the review title and verified-purchase flag for the account that placed the order.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## Order fulfilment

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Staff order queue</h3>
<a href="visuals/11-admin-order-before-update.png"><img src="visuals/11-admin-order-before-update.png" alt="Staff order queue" width="100%"/></a>
<p>After staff authentication, the fulfillment queue displays the order before a status transition is requested.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Order marked Packed</h3>
<a href="visuals/12-admin-order-updated.png"><img src="visuals/12-admin-order-updated.png" alt="Order marked Packed" width="100%"/></a>
<p>The UI confirms the change, and the API confirms the persisted Packed status and the Processing → Packed event history.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## Wishlist

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Saved wishlist</h3>
<a href="visuals/13-saved-wishlist.png"><img src="visuals/13-saved-wishlist.png" alt="Saved wishlist" width="100%"/></a>
<p>A real seeded catalog product has been saved, and the wishlist drawer displays the selected item before any bag action.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Product comparison

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Side-by-side product comparison</h3>
<a href="visuals/14-product-comparison.png"><img src="visuals/14-product-comparison.png" alt="Side-by-side product comparison" width="100%"/></a>
<p>Two seeded catalog products appear together in the comparison matrix, with customer rating, finish, coverage and skin-type attributes.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Virtual try-on

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Virtual try-on studio</h3>
<a href="visuals/15-virtual-try-on.png"><img src="visuals/15-virtual-try-on.png" alt="Virtual try-on studio" width="100%"/></a>
<p>The virtual mirror opens for a real foundation from the seeded catalog. The finish control is changed before the screenshot is captured.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Try-on shade added to the bag</h3>
<a href="visuals/16-vto-shade-added-to-bag.png"><img src="visuals/16-vto-shade-added-to-bag.png" alt="Try-on shade added to the bag" width="100%"/></a>
<p>After adding the selected finish, the shopping bag opens with the same seeded foundation. This confirms the mirror action reaches the cart drawer.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## Ingredient diagnostics

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Ingredient safety diagnostic</h3>
<a href="visuals/17-ingredient-diagnostics.png"><img src="visuals/17-ingredient-diagnostics.png" alt="Ingredient safety diagnostic" width="100%"/></a>
<p>The product diagnostic displays its standard, pore-clog index, formula pH and ingredient safety information for the selected catalog product.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</tbody>
</table>

## Beauty personalisation

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Personalised shade match</h3>
<a href="visuals/18-shade-match.png"><img src="visuals/18-shade-match.png" alt="Personalised shade match" width="100%"/></a>
<p>The deterministic catalog-backed matcher returns an in-stock shade for the selected medium depth and warm undertone; this is not a live Gemini-provider test.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Morning and evening routine</h3>
<a href="visuals/19-skincare-routine.png"><img src="visuals/19-skincare-routine.png" alt="Morning and evening routine" width="100%"/></a>
<p>The deterministic routine builder recommends real catalog products in separate AM and PM steps. Live external AI generation remains a separate integration check.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

## Boutique locator

<table>
<tbody>
<tr>
<td width="50%" valign="top">
<h3>01. Boutique directory</h3>
<a href="visuals/20-boutique-directory.png"><img src="visuals/20-boutique-directory.png" alt="Boutique directory" width="100%"/></a>
<p>The locator displays the seeded boutique directory using the built-in fallback path; no GPS permission is requested.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
<td width="50%" valign="top">
<h3>02. Pickup location selected</h3>
<a href="visuals/21-pickup-store-selected.png"><img src="visuals/21-pickup-store-selected.png" alt="Pickup location selected" width="100%"/></a>
<p>The selected boutique is visibly marked in the locator after the user chooses it as the preferred pickup location.</p>
<p><em>Viewport: 1280 × 720</em></p>
</td>
</tr>
</tbody>
</table>

---

**Verification note:** The screenshot shows the browser UI at a successful checkpoint. Backend assertions separately verify account ownership, the stored order, server-calculated totals, verified-purchase reviews and persisted fulfilment status. A screenshot alone is not used as proof of those server-side behaviors.
