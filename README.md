# Sole Ties Thrift Shop

**Sole Ties** is a web-based thrift shop for sneakers and shoes. It allows users to browse available products, add items to their cart, buy shoes, and keep track of purchased ("shopped") items—all with a clean, easy-to-use interface.

## Features

- **Browse Products:** View a curated list of pre-loved and new sneakers.
- **Add to Cart:** Select shoes and add them to your shopping cart.
- **Buy Items:** Purchase shoes directly from your cart or from the products page.
- **Shopped Items:** See a list of items you have purchased (“Shopped Items”).
- **Persistent Cart & Purchases:** Cart and purchase history are saved in your browser.
- **Easy Navigation:** Switch between Products, Shopped Items, and About sections.
- **Social Links:** Follow us on TikTok and Instagram.

## Getting Started

### 1. Backend Setup

This project uses [`json-server`](https://github.com/typicode/json-server) for a mock REST API.

- Make sure you have Node.js installed.
- Install json-server globally (if needed):

  ```bash
  npm install -g json-server
  ```

- Start the API (from the project root):

  ```bash
  json-server --watch db.json --port 3001
  ```

### 2. Frontend Setup

- Open `index.html` in your browser.
- The frontend will automatically fetch products from the running API.

## Deploying Your API

To keep your API always available (even when your computer is off), deploy your project (including `db.json` and `package.json`) to a cloud service like [Render.com](https://render.com/) or [Railway](https://railway.app/).

## Customization

- Edit `db.json` to add, remove, or change products.
- Update social links and branding in `index.html` as needed.

## License

This project is for educational and demonstration purposes.
