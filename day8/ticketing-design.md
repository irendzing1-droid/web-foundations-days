# TicketHub: System Design Document

## 1. Requirements

### Functional Requirements

- Users can browse upcoming concerts and events.
- Users can view available seats for a specific event.
- Users can select a seat and place a temporary hold (reservation) on it.
- Users can pay for held tickets to finalize the purchase.
- Users can view their purchased tickets.

### Non-Functional Requirements

- **Speed:** The system must remain highly responsive during the "big sale" (200,000 users in 10 minutes).
- **Correctness:** A seat can never be sold twice. Double-booking is strictly forbidden.
- **Fairness:** The system must handle concurrent requests fairly using a first-come, first-served queueing mechanism. Bots should be blocked.

---

## 2. Traffic Estimates

### Normal Traffic

- 50,000 people visit on a normal day, viewing 10 pages each.
- Total daily requests: 500,000.
- **Average Normal Traffic:** ~6 requests per second.

### "Big Sale" Peak Traffic

- 200,000 people try to buy 20,000 seats within the first 10 minutes (600 seconds).
- **Peak Traffic:** ~333 requests per second (RPS) just for the purchase flow. (Not including page loads).
- **Storage:** For this exercise, we assume text-based data (user info, seat numbers, order IDs) fits comfortably in a relational database, while event posters/images are handled by object storage.

---

## 3. API Design

| Method | Endpoint                | Description                              |
| :----- | :---------------------- | :--------------------------------------- |
| GET    | `/api/events`           | Browse all events.                       |
| GET    | `/api/events/:id/seats` | View available seats for an event.       |
| POST   | `/api/reserve`          | Place a temporary hold on a seat.        |
| POST   | `/api/pay`              | Process payment and finalize the ticket. |
| GET    | `/api/tickets`          | View user's purchased tickets.           |

---

## 4. Data Model

We need 4 tables: `users`, `events`, `seats`, and `orders`.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL
);

CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id),
    seat_number VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' -- available, held, sold
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    seat_id INT REFERENCES seats(id) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. Preventing Double-Booking (The Core Problem)

To prevent two people from buying the same seat simultaneously during the "big sale," we rely on **Database Transactions** and **Pessimistic Locking**.

When a user clicks "Reserve" (POST `/api/reserve`), the backend executes the following transaction:

1.  **START TRANSACTION.**
2.  **SELECT ... FOR UPDATE** on the specific seat row. This locks the row in the database. Any other request trying to read/write this exact seat will be forced to wait.
3.  Check if the seat `status` is `'available'`.
4.  If yes, **UPDATE** the seat `status` to `'held'`.
5.  **COMMIT** the transaction, releasing the lock.

If a second user tries to reserve the same seat milliseconds later, they will be blocked at Step 2 until the first user commits. Once committed, the second user will see the status is `'held'` and receive an error.

---

## 6. Architecture Diagram

```text
[ Client / Browser ]
        |
[ DNS & CDN (Static Assets) ]
        |
[ Web Application Firewall (WAF) ] <-- Blocks Bots
        |
[ Load Balancer ]
        |
[ Message Queue (RabbitMQ) ] <-- Queues incoming purchase requests (FIFO)
        |
[ App Servers (x4) ] <-- Process queue at a safe rate
        |
[ Redis Cache ] (Caches event data)
        |
[ Primary Database (PostgreSQL) ]
```

---

## 7. Trade-offs

1.  **Pessimistic Locking vs. Optimistic Locking:** We chose Pessimistic Locking (`SELECT FOR UPDATE`) for the seats. While it can slow down the system because users have to wait for locks, it guarantees absolute correctness. For high-stakes ticketing, preventing a double-booking is worth the slight performance hit.
2.  **Queueing vs. Immediate Response:** Instead of letting users hit the database directly, we put them in a queue. The trade-off is that some users will have to wait a few extra seconds to see if they got the ticket, but this ensures the system stays online and doesn't crash under the load.
