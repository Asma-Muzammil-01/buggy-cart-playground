# Mock Buggy E-Commerce Store (The Test Playground)

Mock Buggy E-Commerce Store (The Test Playground) - Build a fully responsive e-commerce web application called "BuggyCart" designed specifically as a test automation playground. Include a home page with product grids, a product details page, a cart sidebar, and a checkout wizard. Implement a toggle in the settings menu labeled "Enable Chaos Mode" that activates intentional, subtle frontend bugs. These bugs should include: a promo code "SAVE10" that accidentally subtracts $100 instead of 10%, a race condition where double-clicking "Add to Cart" duplicates the item but breaks the total price calculation, an edge-case validation error where a zip code containing a "0" causes the checkout form submit button to lock up, and a visual alignment bug on the cart page when more than 3 items are added. Ensure the UI is clean and modern using Tailwind CSS, making it a perfect target for Cypress or Playwright automated testing scripts.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://buggy-cart-playground.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/90186988-9ed1-45a1-ba36-107568c51ef9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
