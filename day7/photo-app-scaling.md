# SnapShare: Scaling Plan

## 1. Assumptions & Daily Active Users

**Starting Facts:**

- Total registered users: 10,000,000
- Daily active users (DAU): 10% of registered = **1,000,000 DAU**
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Average photo size: 2 MB
- Thumbnail size: 50 KB

**Calculated Assumptions:**

- We assume traffic is spread across a 24-hour period, but we must design for peak traffic (assumed to be 5x the average).
- We assume 1 feed page contains exactly 1 photo for the sake of bandwidth calculation.

---

## 2. Traffic & Storage Estimates

**Uploads Per Second:**

- Average: 1,000,000 uploads / 86,400 seconds = **~11.5 uploads/second**
- Peak (5x): **~57.5 uploads/second**

**Feed Views Per Second:**

- Average: (1,000,000 users \* 50 views) / 86,400 seconds = **~578 views/second**
- Peak (5x): **~2,890 views/second**

**Storage Per Year:**

- Photos: 1,000,000 photos/day \* 2 MB = 2,000,000 MB (or 2 TB) per day.
- Thumbnails: 1,000,000 photos/day \* 50 KB = 50,000,000 KB (or 50 GB) per day.
- Total Daily Storage: 2.05 TB
- **Total Yearly Storage:** 2.05 TB \* 365 days = **~748 TB per year**

---

## 3. Read-Heavy vs. Write-Heavy

This system is **Read-Heavy**.

- **What this means for the design:** A read-heavy system means users are requesting data (viewing feeds) far more often than they are writing data (uploading photos). At peak, we have ~57 uploads/sec but ~2,890 views/sec. Because reads outnumber writes by 50-to-1, our architecture must prioritize fast data retrieval. We need aggressive caching (Redis), CDNs, and database read replicas to handle the load without crashing the database.

---

## 4. Database Storage for Photos

Photos should **never** be stored directly inside the database (as BLOBs). Databases are optimized for structured text and small data, not large 2 MB files. Storing files in a DB will cause massive performance bottlenecks and make backups impossibly slow.

**Where they should go instead:** Photos should be stored in an **Object Storage** service (like AWS S3 or Google Cloud Storage). The database should only store the _metadata_ (User ID, timestamp, captions) and the _URL/path_ to the file in the Object Storage.

---

## 5. Architecture Diagram (Text)

```text
[ Client (Mobile/Web) ]
          |
          v
[ CDN (Content Delivery Network) ]  <-- Serves cached images and thumbnails
          |
          v
[ Load Balancer ]                   <-- Distributes traffic evenly
          |
    ---------------------------------
    |               |               |
[ App Server 1 ] [ App Server 2 ] [ App Server 3 ] <-- Stateless API servers
    |               |               |
    ---------------------------------
          |               |
          v               v
[ Cache (Redis) ]   [ Message Queue (Kafka) ]
          |               |
          v               v
[ Primary Database ] <--- [ Worker Nodes (Thumbnail Creator) ]
          |
          v
[ Read Replicas (x3) ]
          |
          v
[ Object Storage (S3) ] <--- Stores original photos and thumbnails
```

## 6. Component Explanations

1. **Client (Mobile/Web):** The user interface where photos are uploaded and viewed. Interacts with the system via HTTP/REST APIs.

2. **CDN (Content Delivery Network):** Caches and serves static assets (images and thumbnails) from edge locations close to the user, drastically reducing latency and load on our main servers.

3. **Load Balancer:** Distributes incoming API traffic evenly across multiple app servers to prevent any single server from being overwhelmed.

4. **App Servers (x3):** Stateless servers that handle business logic, user authentication, and API requests. Because they are stateless, we can easily add more servers horizontally as traffic grows.

5. **Cache (Redis):** An in-memory data store that holds frequently accessed data (like popular user feeds or user sessions). This prevents the database from being hit for every single read request.

6. **Primary Database:** The single source of truth for structured metadata (users, relationships, image URLs). Handles all write operations (INSERT/UPDATE/DELETE).

7. **Read Replicas (x3):** Copies of the primary database that handle read-only queries. This offloads read traffic from the primary database.

8. **Message Queue (Kafka):** A durable queue that holds background jobs. This decouples the slow image-processing tasks from the fast API response cycle.

9. **Worker Nodes:** Background servers that pull jobs from the Message Queue. They process CPU-heavy tasks like resizing images and generating thumbnails.

10. **Object Storage (S3):** Highly durable and scalable storage for large binary files (original photos and generated thumbnails). Replaces storing images in the database.

---

## 7. Step-by-Step Upload Flow (Handling Peak Load)

To handle 57 uploads/second without degrading the user experience, the upload process must be asynchronous:

1. **User Uploads:** The user selects a photo on the client and clicks "Upload". The client sends a POST request to the API with the image file.
2. **App Server Validates:** The Load Balancer routes the request to an App Server. The App Server authenticates the user and validates the image format/size.
3. **Upload to Object Storage:** The App Server uploads the raw image directly to Object Storage (S3).
4. **Save Metadata:** The App Server writes the image metadata (User ID, URL, timestamp) to the Primary Database with a status of "processing".
5. **Queue the Job:** The App Server pushes a message to the Message Queue (Kafka) containing the image ID and storage URL.
6. **Immediate Response:** The App Server instantly returns a 202 Accepted response to the client. The user sees a success message immediately, rather than waiting for the image to process.
7. **Background Processing:** A Worker Node picks up the message from the queue. It downloads the original image from S3, resizes it, generates a thumbnail, and uploads the thumbnail back to S3.
8. **Update Status:** The Worker Node updates the database record status to "completed" and stores the new thumbnail URL.

---

## 8. Trade-off Analysis

1. **Eventual Consistency vs. Strong Consistency:** By using Read Replicas, we introduce a slight delay where a user might upload a photo and not immediately see it on a different device (if the replica hasn't synced yet). We accept this "eventual consistency" trade-off because it prevents the primary database from being overwhelmed by read queries.

2. **Cache Invalidation Complexity:** Using Redis drastically improves read speeds, but it introduces the "cache invalidation problem." If a user deletes a photo, we must ensure it's removed from the cache immediately. Otherwise, users might see deleted data. This adds complexity to the backend code.

3. **Operational Overhead of Queues:** Introducing Kafka and Worker Nodes prevents our App Servers from blocking on image processing. However, this introduces significant operational overhead. We now have to monitor the queue length, handle failed jobs (Dead Letter Queues), and manage the worker infrastructure.
