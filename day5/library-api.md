# Library API Design

This document outlines the RESTful API endpoints for the Library application. It acts as a contract for the frontend and backend teams.

Base URL: `/api`

---

## Endpoints

### 1. Retrieve all books

- **Method:** `GET`
- **Endpoint:** `/books`
- **Description:** Retrieves a list of all books in the library.
- **Response (200 OK):** Array of book objects.

### 2. Retrieve a single book

- **Method:** `GET`
- **Endpoint:** `/books/:id`
- **Description:** Retrieves details of a specific book by its ID.
- **Response (200 OK):** A single book object.

### 3. Create a new book

- **Method:** `POST`
- **Endpoint:** `/books`
- **Description:** Adds a new book to the library.
- **Request Body:** `{ "title": "New Book", "author": "Jane Doe" }`
- **Response (201 Created):** The newly created book object.

### 4. Update an existing book

- **Method:** `PUT`
- **Endpoint:** `/books/:id`
- **Description:** Updates the details of an existing book.
- **Request Body:** `{ "title": "Updated Title", "author": "Updated Author" }`
- **Response (200 OK):** The updated book object.

### 5. Delete a book

- **Method:** `DELETE`
- **Endpoint:** `/books/:id`
- **Description:** Removes a book from the library.
- **Response (204 No Content):** (Empty body)

### 6. Filter books by author

- **Method:** `GET`
- **Endpoint:** `/books?author=:authorName`
- **Description:** Retrieves all books written by a specific author.
- **Response (200 OK):** Array of book objects matching the author.

---

## Error Codes and Use Cases

### 400 Bad Request

- **Use Case:** The client sends invalid data in the request body (e.g., missing required fields like "title" or "author" when creating a book, or sending the wrong data type).
- **Response:** `{ "error": "Bad Request", "message": "Title and author are required fields." }`

### 404 Not Found

- **Use Case:** The client requests a specific book ID that does not exist in the database.
- **Response:** `{ "error": "Not Found", "message": "Book with the specified ID does not exist." }`
