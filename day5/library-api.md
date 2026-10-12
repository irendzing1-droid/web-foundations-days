# Library Books API Design

A REST API for managing the `books` resource in the library system.

**Base URL:** `https://api.mylibrary.com/v1`

---

## Endpoints

### 1. List all books

- **Method:** `GET`
- **Path:** `/books`
- **Description:** Retrieves a list of all books in the library.
- **Request Body:** None
- **Success Response:** `200 OK`

```json
[
  { "id": 1, "title": "The Hobbit", "author": "J.R.R. Tolkien", "year": 1937 },
  { "id": 2, "title": "1984", "author": "George Orwell", "year": 1949 }
]
```
