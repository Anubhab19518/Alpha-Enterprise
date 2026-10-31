# Customer-Facing E-Commerce Storefront API Contract & Documentation
og
This document serves as the official API contract and integration guide for customer-facing storefront applications operating on the **Alpha Enterprise Multi-Tenant E-Commerce Platform**.

---

## 1. Multi-Tenant Architecture & Storefront Identification

The backend is built as a generic, multi-tenant SaaS platform serving multiple distinct storefronts (e.g., *Urban Vogue*, *PureClean Solutions*, *FreshHarvest Grocers*, *VoltTech Electronics*, *FitPulse Athletics*).

### How a Customer Storefront Identifies Its Tenant

To scope catalog requests to a specific storefront, the backend uses **Tenant Scope Extraction**. A customer-facing storefront can specify its store context using any of the following 3 mechanisms (in order of resolution precedence):

1. **HTTP Request Header (Recommended)**:
   ```http
   X-Ecommerce-Id: 3a2bdaa8-668a-46ab-86aa-bccc3764ae87
   ```
2. **URL Query Parameter**:
   ```http
   GET /api/v1/catalog/products?ecommerceId=3a2bdaa8-668a-46ab-86aa-bccc3764ae87
   ```
3. **Slug Resolution Endpoint**:
   If the storefront knows its domain or slug (e.g., `urbanvogue`), it resolves its tenant configuration via:
   ```http
   GET /api/v1/catalog/ecommerce
   ```
   Filter by slug to obtain the `ecommerceId` UUID.

---

## 2. API Overview & Implementation Status

| Feature / Area | Status | Base Path | Description |
| :--- | :--- | :--- | :--- |
| **Authentication & Profile** | ✅ **Implemented** | `/api/v1/auth` | Login, Register, Refresh Token, Profile retrieval. |
| **E-Commerce Stores (Tenants)** | ✅ **Implemented** | `/api/v1/catalog/ecommerce` | List and retrieve tenant store details. |
| **Category Tree** | ✅ **Implemented** | `/api/v1/catalog/categories` | Hierarchical category navigation (LTREE path strings). |
| **Products Catalog** | ✅ **Implemented** | `/api/v1/catalog/products` | Base product listings, details, and filtering. |
| **Product & Variant Images** | ✅ **Implemented** | `/api/v1/catalog/products/:id/images` | Cloudinary CDN secure image URLs and public asset IDs. |
| **Product Options & Values** | ✅ **Implemented** | `/api/v1/catalog/products/:id/options` | Dynamic option axes (Size, Color) and option values with units. |
| **Product Variants** | ✅ **Implemented** | `/api/v1/catalog/products/:id/variants` | Variant SKUs, stock inventory, and override pricing. |
| **Units (Reference Data)** | ✅ **Implemented** | `/api/v1/catalog/units` | Measurement units (g, kg, ml, L, cm, pcs). |
| **Customer Cart** | ❌ *Pending Implementation* | `/api/v1/cart` | Shopping cart operations (Add to cart, update quantity). |
| **Checkout & Orders** | ❌ *Pending Implementation* | `/api/v1/orders` | Order creation, payment processing, order history. |
| **Wishlist** | ❌ *Pending Implementation* | `/api/v1/wishlist` | Saved favorite products per customer. |
| **Reviews & Ratings** | ❌ *Pending Implementation* | `/api/v1/reviews` | Customer product reviews and star ratings. |

---

## 3. Product & Variant Pricing Semantics

Every product and variant features **Normal Price (`price`)** and **Offer Price (`offerPrice`)**:

- **Product Base Pricing**: Set on the parent product level.
- **Variant Pricing & Inheritance**:
  - If `variant.price` is `null`, the variant inherits the parent product's `price`.
  - If `variant.offerPrice` is `null`, the variant inherits the parent product's `offerPrice`.
  - If `variant.price` is specified, the variant overrides product pricing.
- **Effective Pricing**: Storefront displays use effective price (`effectivePrice`) and effective offer price (`effectiveOfferPrice`).
- **Discount Percentage**:
  $$\text{Discount \%} = \left( \frac{\text{effectivePrice} - \text{effectiveOfferPrice}}{\text{effectivePrice}} \right) \times 100$$
- **Validation**: Enforced at backend service level: `offerPrice <= price` for both products and variants.

---

## 4. Implemented Customer-Consumable Endpoints

### A. Authentication Module (`/api/v1/auth`)

#### 1. User Registration
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/register`
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "status": "ok",
    "data": {
      "user": {
        "id": "c1f7a2d8-90e1-4c2b-8f3a-5d6e7f8a9b0c",
        "email": "customer@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "status": "ACTIVE"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

#### 2. User Login
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/login`
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "data": {
      "user": {
        "id": "c1f7a2d8-90e1-4c2b-8f3a-5d6e7f8a9b0c",
        "email": "customer@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "refreshToken": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

#### 3. Refresh Token
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/refresh`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1Ni..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "refreshToken": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

---

### B. E-Commerce Stores (`/api/v1/catalog/ecommerce`)

#### 1. List Available Stores
- **Method**: `GET`
- **Endpoint**: `/api/v1/catalog/ecommerce`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "data": [
      {
        "id": "3a2bdaa8-668a-46ab-86aa-bccc3764ae87",
        "name": "Urban Vogue",
        "slug": "urbanvogue",
        "status": "ACTIVE",
        "settings": {
          "currency": "USD"
        }
      }
    ]
  }
  ```

---

### C. Categories Navigation (`/api/v1/catalog/categories`)

#### 1. List Store Categories
- **Method**: `GET`
- **Endpoint**: `/api/v1/catalog/categories`
- **Header**: `X-Ecommerce-Id: <uuid>`
- **Query Parameters**:
  - `includeInactive` (boolean, optional, default: false)
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "data": [
      {
        "id": "154e5591-5b00-4eed-b169-2b0de4d52132",
        "name": "Hoodies",
        "slug": "hoodies",
        "path": "hoodies",
        "parentId": null,
        "displayOrder": 0
      },
      {
        "id": "ab5ec1a5-84ad-4a52-98f0-1c4ecf9dbee2",
        "name": "Zip-Up Hoodies",
        "slug": "zip_up_hoodies",
        "path": "hoodies.zip_up_hoodies",
        "parentId": "154e5591-5b00-4eed-b169-2b0de4d52132",
        "displayOrder": 1
      }
    ]
  }
  ```

---

### D. Products Catalog (`/api/v1/catalog/products`)

#### 1. List Store Products
- **Method**: `GET`
- **Endpoint**: `/api/v1/catalog/products`
- **Header**: `X-Ecommerce-Id: <uuid>`
- **Query Parameters**:
  - `categoryId` (UUID, optional): Filter by category ID.
  - `status` (string, optional): Filter by status (`PUBLISHED`, `DRAFT`, `ARCHIVED`). Default returns `PUBLISHED`.
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "data": [
      {
        "id": "f2a89c10-3b4e-4f5a-9d6c-7e8f9a0b1c2d",
        "ecommerceId": "3a2bdaa8-668a-46ab-86aa-bccc3764ae87",
        "categoryId": "154e5591-5b00-4eed-b169-2b0de4d52132",
        "name": "Essential Fleece Hoodie",
        "slug": "essential-fleece-hoodie",
        "description": "Heavyweight premium cotton fleece hoodie.",
        "price": 89.99,
        "offerPrice": 69.99,
        "quantity": 0,
        "computedQuantity": 150,
        "hasVariants": true,
        "status": "PUBLISHED",
        "images": [
          {
            "id": "img-01",
            "url": "https://res.cloudinary.com/demo/image/upload/v1/products/hoodie-main.jpg",
            "publicId": "products/hoodie-main",
            "displayOrder": 0
          }
        ]
      }
    ]
  }
  ```

#### 2. Get Product Details by ID
- **Method**: `GET`
- **Endpoint**: `/api/v1/catalog/products/:id`
- **Header**: `X-Ecommerce-Id: <uuid>`
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "data": {
      "id": "f2a89c10-3b4e-4f5a-9d6c-7e8f9a0b1c2d",
      "name": "Essential Fleece Hoodie",
      "slug": "essential-fleece-hoodie",
      "price": 89.99,
      "offerPrice": 69.99,
      "hasVariants": true,
      "computedQuantity": 150,
      "category": {
        "id": "154e5591-5b00-4eed-b169-2b0de4d52132",
        "name": "Hoodies",
        "slug": "hoodies"
      },
      "images": [
        {
          "id": "img-01",
          "url": "https://res.cloudinary.com/demo/image/upload/v1/products/hoodie-main.jpg",
          "publicId": "products/hoodie-main",
          "displayOrder": 0
        }
      ],
      "options": [
        {
          "id": "opt-color",
          "name": "Color",
          "displayOrder": 0,
          "values": [
            { "id": "val-black", "value": "Black", "unitId": null },
            { "id": "val-heather", "value": "Heather Grey", "unitId": null }
          ]
        },
        {
          "id": "opt-size",
          "name": "Size",
          "displayOrder": 1,
          "values": [
            { "id": "val-s", "value": "S", "unitId": null },
            { "id": "val-m", "value": "M", "unitId": null }
          ]
        }
      ],
      "variants": [
        {
          "id": "var-01",
          "sku": "HOODIE-BLK-S",
          "price": null,
          "offerPrice": null,
          "quantity": 50,
          "status": "ACTIVE",
          "optionValues": [
            { "id": "val-black", "value": "Black" },
            { "id": "val-s", "value": "S" }
          ],
          "images": [
            {
              "id": "vimg-01",
              "url": "https://res.cloudinary.com/demo/image/upload/v1/variants/hoodie-black-s.jpg",
              "publicId": "variants/hoodie-black-s"
            }
          ]
        }
      ]
    }
  }
  ```

---

### E. Product Variants & Stock (`/api/v1/catalog/products/:productId/variants`)

#### 1. List Product Variants
- **Method**: `GET`
- **Endpoint**: `/api/v1/catalog/products/:productId/variants`
- **Header**: `X-Ecommerce-Id: <uuid>`
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "data": [
      {
        "id": "var-01",
        "productId": "f2a89c10-3b4e-4f5a-9d6c-7e8f9a0b1c2d",
        "sku": "HOODIE-BLK-S",
        "price": null,
        "offerPrice": null,
        "quantity": 50,
        "status": "ACTIVE",
        "optionValues": [
          { "id": "val-black", "value": "Black" },
          { "id": "val-s", "value": "S" }
        ],
        "images": []
      }
    ]
  }
  ```

---

### F. Units Reference Data (`/api/v1/catalog/units`)

#### 1. List Measurement Units
- **Method**: `GET`
- **Endpoint**: `/api/v1/catalog/units`
- **Query Parameters**:
  - `category` (string, optional): Filter by unit category (`weight`, `volume`, `length`, `piece`).
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "data": [
      { "id": "u-g", "name": "Gram", "symbol": "g", "category": "weight" },
      { "id": "u-kg", "name": "Kilogram", "symbol": "kg", "category": "weight" },
      { "id": "u-ml", "name": "Milliliter", "symbol": "ml", "category": "volume" },
      { "id": "u-l", "name": "Liter", "symbol": "L", "category": "volume" }
    ]
  }
  ```

---

## 5. Error Responses Reference

All API error responses follow a standardized JSON format:

```json
{
  "status": "error",
  "message": "Human-readable error explanation",
  "errors": [
    {
      "field": "offerPrice",
      "message": "Offer price cannot exceed normal price"
    }
  ]
}
```

### Standard HTTP Status Codes

| Code | Status | Meaning & Common Triggers |
| :--- | :--- | :--- |
| **400** | `Bad Request` | Validation failure (e.g. `offerPrice > price`, invalid MIME type, missing file). |
| **401** | `Unauthorized` | Missing or expired JWT Access Token. |
| **403** | `Forbidden` | User lacks role or tenant scope access for `X-Ecommerce-Id`. |
| **404** | `Not Found` | Resource ID (product, variant, category, image) does not exist. |
| **409** | `Conflict` | Duplicate slug, SKU, or identical variant option combination. |
| **500** | `Internal Server Error` | Unhandled server exception. |
