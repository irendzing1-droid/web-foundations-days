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
