# Sayphora — Product Walkthrough

Sayphora is a full-stack beauty shopping experience built around product discovery, informed buying decisions, customer accounts, order management and store operations. This visual tour shows how the storefront and staff console look and how the main customer journeys fit together.

**51 product screens · Customer and staff journeys · Desktop and mobile layouts**

## How the application works

The storefront is built with **React**, and it communicates with a **TypeScript/Express API**. **PostgreSQL** stores the application data. The backend is responsible for account and session rules, catalogue records, stock, pricing, promotions, orders, reviews, wishlists and loyalty activity. The storefront presents that data and sends actions to the API; it does not act as the final authority for prices, inventory or order state.

The screenshots use the application's seeded catalogue and example accounts so the full experience can be explored without exposing real customer information. Where an interaction changes application data—such as creating an order, changing inventory, saving a product or pausing a promotion—the related screens show the resulting application state.

## The product at a glance

- **Discover:** Browse the catalogue, search, filter, sort and compare product details.
- **Choose:** Explore ingredient information, shade matching, routines, bundles and virtual try-on.
- **Shop:** Register, save products, apply promotions, choose samples and gift options, then place and track an order.
- **Return:** Review loyalty points and redeem available rewards.
- **Operate:** Staff can manage products, inventory, orders, reviews and promotions through a protected console.

---

## 1. The storefront

The storefront is the starting point for the customer journey. Product listings lead into deeper product information, while search, filters and display preferences make the catalogue easier to explore.

<table>
<tr>
<td width="100%" valign="top">
<p align="center"><strong>THE STORE</strong></p>
<a href="screenshots/01-storefront-catalogue.png"><img src="screenshots/01-storefront-catalogue.png" alt="Storefront catalogue" width="100%" /></a>
<p><strong>Storefront catalogue</strong><br/>The main storefront brings the beauty catalogue, product cards, prices and shopping entry points together.<br/><sub>Desktop view · <a href="screenshots/01-storefront-catalogue.png">View full-size image</a></sub></p>
</td>
</tr>
</table>

### Browse first, then narrow the catalogue

Search, catalogue filters and sorting help shoppers narrow the selection. The adjacent storefront preferences view shows currency display and newsletter sign-up.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>DISCOVERY CONTROLS</strong></p>
<a href="screenshots/22-storefront-refinements.png"><img src="screenshots/22-storefront-refinements.png" alt="Catalogue filtering, sorting and editorial view" width="100%" /></a>
<p><strong>Catalogue filtering, sorting and editorial view</strong><br/>Search, filters, sorting and the alternate catalogue presentation help narrow product discovery.<br/><sub>Desktop view · <a href="screenshots/22-storefront-refinements.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>STOREFRONT PREFERENCES</strong></p>
<a href="screenshots/23-newsletter-currency.png"><img src="screenshots/23-newsletter-currency.png" alt="Currency preference and newsletter confirmation" width="100%" /></a>
<p><strong>Currency preference and newsletter confirmation</strong><br/>The storefront includes a currency display preference and newsletter sign-up experience.<br/><sub>Desktop view · <a href="screenshots/23-newsletter-currency.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Compare products and inspect the details

The comparison matrix helps evaluate product attributes together, while the image viewer provides a closer look at product imagery.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>SIDE-BY-SIDE COMPARISON</strong></p>
<a href="screenshots/14-product-comparison.png"><img src="screenshots/14-product-comparison.png" alt="Side-by-side product comparison" width="100%" /></a>
<p><strong>Side-by-side product comparison</strong><br/>The comparison matrix places product attributes side by side to support a more informed choice.<br/><sub>Desktop view · <a href="screenshots/14-product-comparison.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>PRODUCT IMAGE VIEW</strong></p>
<a href="screenshots/24-product-gallery-lightbox.png"><img src="screenshots/24-product-gallery-lightbox.png" alt="Product image lightbox" width="100%" /></a>
<p><strong>Product image lightbox</strong><br/>The image viewer opens product imagery in a larger inspection view.<br/><sub>Desktop view · <a href="screenshots/24-product-gallery-lightbox.png">View full-size image</a></sub></p>
</td>
</tr>
</table>



## 2. Account and shopping bag

Customers can create an account, build a bag, apply a promotion and adjust their selection. The views below make the result of each action visible.

### Create an account

After the registration form is submitted successfully, the customer moves into the shopping experience.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · REGISTRATION</strong></p>
<a href="screenshots/02-registration-form.png"><img src="screenshots/02-registration-form.png" alt="Registration form" width="100%" /></a>
<p><strong>Registration form</strong><br/>A new customer enters the details needed to create an account.<br/><sub>Desktop view · <a href="screenshots/02-registration-form.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · ACCOUNT READY</strong></p>
<a href="screenshots/03-registration-success.png"><img src="screenshots/03-registration-success.png" alt="Account created" width="100%" /></a>
<p><strong>Account created</strong><br/>After registration, the customer reaches the shopping experience in an authenticated state.<br/><sub>Desktop view · <a href="screenshots/03-registration-success.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Apply a promotion

The bag moves from a selected product to a state where the accepted promotion is reflected in the order summary.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · BAG</strong></p>
<a href="screenshots/04-shopping-bag.png"><img src="screenshots/04-shopping-bag.png" alt="Product added to the bag" width="100%" /></a>
<p><strong>Product added to the bag</strong><br/>The bag shows the selected product and the next step toward checkout.<br/><sub>Desktop view · <a href="screenshots/04-shopping-bag.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · PROMOTION APPLIED</strong></p>
<a href="screenshots/05-promotion-applied.png"><img src="screenshots/05-promotion-applied.png" alt="Promotion accepted" width="100%" /></a>
<p><strong>Promotion accepted</strong><br/>An accepted promotion is reflected in the bag alongside the order value.<br/><sub>Desktop view · <a href="screenshots/05-promotion-applied.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Adjust the bag, then reach the empty state

Quantity, complimentary samples and an applied promotion are presented together. Removing the final item gives the customer a clear empty-bag state.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · ITEMS, SAMPLES AND PROMO</strong></p>
<a href="screenshots/41-cart-samples-promo.png"><img src="screenshots/41-cart-samples-promo.png" alt="Cart quantity, samples and promotion" width="100%" /></a>
<p><strong>Cart quantity, samples and promotion</strong><br/>The bag shows quantity changes, complimentary samples and an applied promotion together.<br/><sub>Desktop view · <a href="screenshots/41-cart-samples-promo.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · EMPTY BAG</strong></p>
<a href="screenshots/42-cart-empty-state.png"><img src="screenshots/42-cart-empty-state.png" alt="Empty bag after removing the item" width="100%" /></a>
<p><strong>Empty bag after removing the item</strong><br/>Removing the final item leaves a clear empty-bag state.<br/><sub>Desktop view · <a href="screenshots/42-cart-empty-state.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Save a wishlist and share it

The wishlist keeps a selected product for later and exposes a share action for the saved selection.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · SAVED PRODUCTS</strong></p>
<a href="screenshots/13-saved-wishlist.png"><img src="screenshots/13-saved-wishlist.png" alt="Saved wishlist" width="100%" /></a>
<p><strong>Saved wishlist</strong><br/>A saved product is kept in the customer's wishlist for later.<br/><sub>Desktop view · <a href="screenshots/13-saved-wishlist.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · SHARE ACTION</strong></p>
<a href="screenshots/40-wishlist-share-link.png"><img src="screenshots/40-wishlist-share-link.png" alt="Shareable wishlist link" width="100%" /></a>
<p><strong>Shareable wishlist link</strong><br/>The wishlist sharing action provides a link to share the saved selection.<br/><sub>Desktop view · <a href="screenshots/40-wishlist-share-link.png">View full-size image</a></sub></p>
</td>
</tr>
</table>



## 3. Product and beauty tools

Product pages bring together purchase choices and helpful context. Sayphora also includes comparison, bundles, virtual try-on, ingredient information, shade matching and routine guidance.

### Product details and customer feedback

A product page leads into customer reviews. The review experience displays verified-purchase context and lets shoppers focus on verified feedback and mark a review helpful.

<table>
<tr>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>PRODUCT DETAIL</strong></p>
<a href="screenshots/09-product-detail.png"><img src="screenshots/09-product-detail.png" alt="Product details" width="100%" /></a>
<p><strong>Product details</strong><br/>Product detail keeps the key purchase information and review entry point close to the product.<br/><sub>Desktop view · <a href="screenshots/09-product-detail.png">View full-size image</a></sub></p>
</td>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>VERIFIED-PURCHASE REVIEW</strong></p>
<a href="screenshots/10-verified-product-review.png"><img src="screenshots/10-verified-product-review.png" alt="Verified purchase review" width="100%" /></a>
<p><strong>Verified purchase review</strong><br/>A customer review is shown with its verified-purchase context.<br/><sub>Desktop view · <a href="screenshots/10-verified-product-review.png">View full-size image</a></sub></p>
</td>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>REVIEW FILTER AND VOTE</strong></p>
<a href="screenshots/44-review-vote-filter.png"><img src="screenshots/44-review-vote-filter.png" alt="Verified review filter and helpful voting" width="100%" /></a>
<p><strong>Verified review filter and helpful voting</strong><br/>Customers can focus on verified-purchase reviews and mark helpful feedback.<br/><sub>Desktop view · <a href="screenshots/44-review-vote-filter.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Explore a foundation finish, then add it to the bag

The selected foundation finish carries from the virtual try-on screen into the shopping bag.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · VIRTUAL TRY-ON</strong></p>
<a href="screenshots/15-virtual-try-on.png"><img src="screenshots/15-virtual-try-on.png" alt="Virtual try-on studio" width="100%" /></a>
<p><strong>Virtual try-on studio</strong><br/>The virtual try-on screen lets a shopper explore a foundation finish.<br/><sub>Desktop view · <a href="screenshots/15-virtual-try-on.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · PRODUCT IN BAG</strong></p>
<a href="screenshots/16-vto-shade-added-to-bag.png"><img src="screenshots/16-vto-shade-added-to-bag.png" alt="Try-on shade added to the bag" width="100%" /></a>
<p><strong>Try-on shade added to the bag</strong><br/>The selected foundation carries from the try-on journey into the shopping bag.<br/><sub>Desktop view · <a href="screenshots/16-vto-shade-added-to-bag.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Build a bundle or choose a product size

Complementary items can be grouped as a bundle. Product detail also exposes size and quantity choices along with the item's application routine.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BUNDLE BUILDER</strong></p>
<a href="screenshots/25-product-bundle-builder.png"><img src="screenshots/25-product-bundle-builder.png" alt="Curated product bundle" width="100%" /></a>
<p><strong>Curated product bundle</strong><br/>The bundle builder groups complementary products and displays the bundle saving.<br/><sub>Desktop view · <a href="screenshots/25-product-bundle-builder.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>SIZE AND APPLICATION ROUTINE</strong></p>
<a href="screenshots/43-product-size-and-ritual.png"><img src="screenshots/43-product-size-and-ritual.png" alt="Product size, quantity and application routine" width="100%" /></a>
<p><strong>Product size, quantity and application routine</strong><br/>Product detail exposes size and quantity selections alongside the item's application routine.<br/><sub>Desktop view · <a href="screenshots/43-product-size-and-ritual.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Explore formulation details and personalised guidance

The ingredient view presents formulation information, while the shade experience suggests an in-catalogue choice based on the selected profile.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>INGREDIENT INFORMATION</strong></p>
<a href="screenshots/17-ingredient-diagnostics.png"><img src="screenshots/17-ingredient-diagnostics.png" alt="Ingredient safety diagnostic" width="100%" /></a>
<p><strong>Ingredient safety diagnostic</strong><br/>The ingredient view presents formulation details and the product's available diagnostic information.<br/><sub>Desktop view · <a href="screenshots/17-ingredient-diagnostics.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>SHADE MATCH</strong></p>
<a href="screenshots/18-shade-match.png"><img src="screenshots/18-shade-match.png" alt="Personalised shade match" width="100%" /></a>
<p><strong>Personalised shade match</strong><br/>The shade-matching experience suggests an in-catalogue option from the selected profile.<br/><sub>Desktop view · <a href="screenshots/18-shade-match.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Build a routine and ask the beauty concierge

The routine builder separates morning and evening steps. The concierge offers catalogue-aware product guidance; live AI-provider answers depend on optional provider configuration.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>AM/PM ROUTINE</strong></p>
<a href="screenshots/19-skincare-routine.png"><img src="screenshots/19-skincare-routine.png" alt="Morning and evening routine" width="100%" /></a>
<p><strong>Morning and evening routine</strong><br/>The routine builder separates recommended steps into morning and evening care.<br/><sub>Desktop view · <a href="screenshots/19-skincare-routine.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>BEAUTY CONCIERGE</strong></p>
<a href="screenshots/30-ai-concierge.png"><img src="screenshots/30-ai-concierge.png" alt="Concierge product recommendation" width="100%" /></a>
<p><strong>Concierge product recommendation</strong><br/>The beauty concierge connects a shopper's question to catalogue-aware product guidance.<br/><sub>Desktop view · <a href="screenshots/30-ai-concierge.png">View full-size image</a></sub></p>
</td>
</tr>
</table>



## 4. Checkout and order journey

Checkout collects the order details before the order is created. Afterwards, customers can open their order and follow its in-app status.

### From checkout review to order tracking

The customer reviews the order, receives an order reference, and can return to the tracking view to see its current progress.

<table>
<tr>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>01 · REVIEW ORDER</strong></p>
<a href="screenshots/06-checkout-review.png"><img src="screenshots/06-checkout-review.png" alt="Checkout review" width="100%" /></a>
<p><strong>Checkout review</strong><br/>The checkout review brings the selected items, delivery details and payable total into one place.<br/><sub>Desktop view · <a href="screenshots/06-checkout-review.png">View full-size image</a></sub></p>
</td>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>02 · ORDER CONFIRMED</strong></p>
<a href="screenshots/07-order-confirmation.png"><img src="screenshots/07-order-confirmation.png" alt="Order confirmation" width="100%" /></a>
<p><strong>Order confirmation</strong><br/>The completed order is shown with its order reference and confirmation details.<br/><sub>Desktop view · <a href="screenshots/07-order-confirmation.png">View full-size image</a></sub></p>
</td>
<td width="33.333333333333336%" valign="top">
<p align="center"><strong>03 · TRACK ORDER</strong></p>
<a href="screenshots/08-order-tracking.png"><img src="screenshots/08-order-tracking.png" alt="Order tracking" width="100%" /></a>
<p><strong>Order tracking</strong><br/>The customer can revisit an order and see its current in-app progress.<br/><sub>Desktop view · <a href="screenshots/08-order-tracking.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Choose gift options and review the final order

Delivery speed, address saving and gift presentation are carried into the review step.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · DELIVERY AND GIFT OPTIONS</strong></p>
<a href="screenshots/26-checkout-gift-options.png"><img src="screenshots/26-checkout-gift-options.png" alt="Express delivery and gift options" width="100%" /></a>
<p><strong>Express delivery and gift options</strong><br/>Delivery speed, saved address and gift presentation can be configured before the final review.<br/><sub>Desktop view · <a href="screenshots/26-checkout-gift-options.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · ORDER REVIEW</strong></p>
<a href="screenshots/27-checkout-gift-review.png"><img src="screenshots/27-checkout-gift-review.png" alt="Checkout review with gift packaging" width="100%" /></a>
<p><strong>Checkout review with gift packaging</strong><br/>Checkout review carries the chosen delivery and gift details forward.<br/><sub>Desktop view · <a href="screenshots/27-checkout-gift-review.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Use the experience on mobile

The mobile order view shows the customer's cancellation state, while the responsive navigation keeps primary storefront sections accessible on a narrow screen.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>CUSTOMER ORDER ACTION</strong></p>
<a href="screenshots/45-customer-order-cancelled.png"><img src="screenshots/45-customer-order-cancelled.png" alt="Order lookup and eligible cancellation" width="100%" /></a>
<p><strong>Order lookup and eligible cancellation</strong><br/>The customer can look up an eligible order and see the cancellation state.<br/><sub>Mobile view · <a href="screenshots/45-customer-order-cancelled.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>COMPACT NAVIGATION</strong></p>
<a href="screenshots/46-mobile-navigation.png"><img src="screenshots/46-mobile-navigation.png" alt="Mobile navigation drawer" width="100%" /></a>
<p><strong>Mobile navigation drawer</strong><br/>The compact mobile navigation keeps key storefront areas reachable on a narrow screen.<br/><sub>Mobile view · <a href="screenshots/46-mobile-navigation.png">View full-size image</a></sub></p>
</td>
</tr>
</table>



## 5. Loyalty, boutique and installation experience

The experience extends beyond the initial purchase with reward redemption, pickup location selection and progressive-web-app features.

### Redeem loyalty points

The member sees their points and eligible rewards, then receives a reward code after redemption.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · AVAILABLE REWARDS</strong></p>
<a href="screenshots/28-loyalty-bazaar.png"><img src="screenshots/28-loyalty-bazaar.png" alt="Member rewards bazaar" width="100%" /></a>
<p><strong>Member rewards bazaar</strong><br/>The loyalty area shows the member's points and available rewards.<br/><sub>Desktop view · <a href="screenshots/28-loyalty-bazaar.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · REWARD CODE</strong></p>
<a href="screenshots/29-loyalty-redemption.png"><img src="screenshots/29-loyalty-redemption.png" alt="Reward code issued" width="100%" /></a>
<p><strong>Reward code issued</strong><br/>Redeeming a reward presents a customer-facing reward code and updated points balance.<br/><sub>Desktop view · <a href="screenshots/29-loyalty-redemption.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Select a pickup location

The directory presents the available boutiques and marks the selected pickup location.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · BOUTIQUE DIRECTORY</strong></p>
<a href="screenshots/20-boutique-directory.png"><img src="screenshots/20-boutique-directory.png" alt="Boutique directory" width="100%" /></a>
<p><strong>Boutique directory</strong><br/>The boutique directory presents available store locations and pickup choices.<br/><sub>Desktop view · <a href="screenshots/20-boutique-directory.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · PICKUP SELECTED</strong></p>
<a href="screenshots/21-pickup-store-selected.png"><img src="screenshots/21-pickup-store-selected.png" alt="Pickup location selected" width="100%" /></a>
<p><strong>Pickup location selected</strong><br/>The chosen boutique is marked as the preferred pickup location.<br/><sub>Desktop view · <a href="screenshots/21-pickup-store-selected.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Use the catalogue offline and view install guidance

Previously cached catalogue content can remain available offline. The install-help view explains the iOS add-to-home-screen steps.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>OFFLINE CATALOGUE</strong></p>
<a href="screenshots/31-pwa-offline-catalog.png"><img src="screenshots/31-pwa-offline-catalog.png" alt="Cached product catalogue while offline" width="100%" /></a>
<p><strong>Cached product catalogue while offline</strong><br/>Previously cached catalogue content remains available in the supported offline experience.<br/><sub>Desktop view · <a href="screenshots/31-pwa-offline-catalog.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>IOS INSTALL GUIDANCE</strong></p>
<a href="screenshots/47-ios-install-guide.png"><img src="screenshots/47-ios-install-guide.png" alt="iOS add-to-home-screen instructions" width="100%" /></a>
<p><strong>iOS add-to-home-screen instructions</strong><br/>The install-help panel explains the add-to-home-screen flow for iOS Safari.<br/><sub>Mobile view · <a href="screenshots/47-ios-install-guide.png">View full-size image</a></sub></p>
</td>
</tr>
</table>



## 6. Staff console

The protected staff console supports day-to-day catalogue and store operations. It includes an overview, product creation, inventory editing, order fulfilment, review moderation, and promotion management.

### Operations overview and service settings

Staff can view an operations summary and reach the configuration/diagnostics surfaces for the optional AI, location and PWA experiences.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>STAFF OVERVIEW</strong></p>
<a href="screenshots/32-admin-overview.png"><img src="screenshots/32-admin-overview.png" alt="Staff executive overview" width="100%" /></a>
<p><strong>Staff executive overview</strong><br/>The staff console brings operational overview information together behind staff access.<br/><sub>Desktop view · <a href="screenshots/32-admin-overview.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AI, LOCATION AND PWA SETTINGS</strong></p>
<a href="screenshots/39-admin-ai-maps-pwa.png"><img src="screenshots/39-admin-ai-maps-pwa.png" alt="AI, Maps and PWA diagnostics" width="100%" /></a>
<p><strong>AI, Maps and PWA diagnostics</strong><br/>The operations area groups the configuration and status surfaces for AI, location and PWA features.<br/><sub>Desktop view · <a href="screenshots/39-admin-ai-maps-pwa.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Create and publish a product

A new product is entered through the staff form and then appears in the inventory table after it is saved.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · PRODUCT FORM</strong></p>
<a href="screenshots/34-admin-product-create-form.png"><img src="screenshots/34-admin-product-create-form.png" alt="New product form" width="100%" /></a>
<p><strong>New product form</strong><br/>The product editor captures the information needed to add a catalogue item.<br/><sub>Desktop view · <a href="screenshots/34-admin-product-create-form.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · PRODUCT IN INVENTORY</strong></p>
<a href="screenshots/48-admin-product-created.png"><img src="screenshots/48-admin-product-created.png" alt="Product successfully published" width="100%" /></a>
<p><strong>Product successfully published</strong><br/>After saving a product, staff can see the new catalogue item in inventory.<br/><sub>Desktop view · <a href="screenshots/48-admin-product-created.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Update stock and identify low inventory

Inventory controls allow staff to update available units; the low-stock view helps bring attention to stock that needs action.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · INVENTORY</strong></p>
<a href="screenshots/33-admin-product-catalog.png"><img src="screenshots/33-admin-product-catalog.png" alt="Product inventory and stock controls" width="100%" /></a>
<p><strong>Product inventory and stock controls</strong><br/>Staff can browse the catalogue and reach inventory controls from the product table.<br/><sub>Desktop view · <a href="screenshots/33-admin-product-catalog.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · UPDATED STOCK</strong></p>
<a href="screenshots/49-admin-low-stock-update.png"><img src="screenshots/49-admin-low-stock-update.png" alt="Inventory updated and low-stock filtered" width="100%" /></a>
<p><strong>Inventory updated and low-stock filtered</strong><br/>The stock count persists and the low-stock view highlights the inventory that needs attention.<br/><sub>Desktop view · <a href="screenshots/49-admin-low-stock-update.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Manage order fulfilment and customer reviews

Separate console areas give staff the tools to inspect the order queue and manage customer feedback.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>ORDER MANAGEMENT</strong></p>
<a href="screenshots/35-admin-order-management.png"><img src="screenshots/35-admin-order-management.png" alt="Order queue and fulfilment controls" width="100%" /></a>
<p><strong>Order queue and fulfilment controls</strong><br/>Order management exposes the queue and the available fulfilment controls.<br/><sub>Desktop view · <a href="screenshots/35-admin-order-management.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>REVIEW MODERATION</strong></p>
<a href="screenshots/36-admin-review-moderation.png"><img src="screenshots/36-admin-review-moderation.png" alt="Customer review moderation" width="100%" /></a>
<p><strong>Customer review moderation</strong><br/>The review console gives staff a place to inspect customer feedback and moderation options.<br/><sub>Desktop view · <a href="screenshots/36-admin-review-moderation.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Move an order through fulfilment

The order view reflects a fulfilment-state change so staff can see where an order is in the process.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · ORDER IN QUEUE</strong></p>
<a href="screenshots/11-admin-order-before-update.png"><img src="screenshots/11-admin-order-before-update.png" alt="Staff order queue" width="100%" /></a>
<p><strong>Staff order queue</strong><br/>Staff can open the order queue and inspect an order before changing its fulfilment status.<br/><sub>Desktop view · <a href="screenshots/11-admin-order-before-update.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · ORDER MARKED PACKED</strong></p>
<a href="screenshots/12-admin-order-updated.png"><img src="screenshots/12-admin-order-updated.png" alt="Order marked Packed" width="100%" /></a>
<p><strong>Order marked Packed</strong><br/>The order view reflects the updated fulfilment state.<br/><sub>Desktop view · <a href="screenshots/12-admin-order-updated.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Set up a promotion

Staff can see existing campaigns and open the form to define a new code and discount.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>PROMOTION LIST</strong></p>
<a href="screenshots/37-admin-promotion-management.png"><img src="screenshots/37-admin-promotion-management.png" alt="Promotion code administration" width="100%" /></a>
<p><strong>Promotion code administration</strong><br/>The promotion area lists campaigns and exposes their management actions.<br/><sub>Desktop view · <a href="screenshots/37-admin-promotion-management.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>NEW PROMOTION FORM</strong></p>
<a href="screenshots/38-admin-promo-create-form.png"><img src="screenshots/38-admin-promo-create-form.png" alt="New promotion form" width="100%" /></a>
<p><strong>New promotion form</strong><br/>The promotion editor gathers the code, discount details and description for a new campaign.<br/><sub>Desktop view · <a href="screenshots/38-admin-promo-create-form.png">View full-size image</a></sub></p>
</td>
</tr>
</table>


### Create a campaign, then pause it

After the campaign is created, staff can pause it and see the changed campaign state.

<table>
<tr>
<td width="50%" valign="top">
<p align="center"><strong>BEFORE · CAMPAIGN ACTIVE</strong></p>
<a href="screenshots/50-admin-promo-created.png"><img src="screenshots/50-admin-promo-created.png" alt="Promotion created from the staff console" width="100%" /></a>
<p><strong>Promotion created from the staff console</strong><br/>The newly created campaign appears in the promotion list.<br/><sub>Desktop view · <a href="screenshots/50-admin-promo-created.png">View full-size image</a></sub></p>
</td>
<td width="50%" valign="top">
<p align="center"><strong>AFTER · CAMPAIGN PAUSED</strong></p>
<a href="screenshots/51-admin-promo-paused.png"><img src="screenshots/51-admin-promo-paused.png" alt="Promotion pause state" width="100%" /></a>
<p><strong>Promotion pause state</strong><br/>The campaign's paused state is reflected in the promotion controls.<br/><sub>Desktop view · <a href="screenshots/51-admin-promo-paused.png">View full-size image</a></sub></p>
</td>
</tr>
</table>



## Availability and integration notes

The core storefront, account, bag, order, catalogue, wishlist, review, loyalty and staff-console experiences are part of the application. A few capabilities depend on deployment configuration or external systems:

- **Beauty concierge:** catalogue-aware guidance is available through the configured fallback. Live Gemini responses require a provider key and working provider access.
- **Boutique locator:** the built-in directory can be displayed without live Maps data. Live place grounding and device location require the relevant Google Maps setup and browser permission.
- **Payments:** checkout currently supports **pay on delivery**; card processing and payment settlement are not implemented as a live gateway.
- **Shipping:** customers can view application-managed order progress; live carrier tracking updates require a carrier integration.
- **Email:** email delivery such as order/reset messages depends on SMTP being configured.
- **Install/offline:** the app includes a service-worker cache and install guidance. The iOS guidance is a help screen, not a native iOS app.

---

[Return to the repository README](../../README.md) · [Browse all walkthrough screenshots](screenshots/)
