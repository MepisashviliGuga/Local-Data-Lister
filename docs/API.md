# API Documentation

## Overview

The API provides access to local data such as restaurants, parks, and events. All endpoints are prefixed with `/api`.

---

## Endpoints

### GET /api/items

- **Description:** Returns a list of items (restaurants, parks, events).
- **Query Parameters:**
  - `search` (string, optional): Filter items by name or type.
- **Response:**
  ```json
  [
    { "id": 1, "name": "Central Park", "type": "park" },
    { "id": 2, "name": "Joe's Pizza", "type": "restaurant" }
  ]
  ```
- **Status Codes:**
  - 200: Success
  - 400: Bad Request
  - 500: Internal Server Error
