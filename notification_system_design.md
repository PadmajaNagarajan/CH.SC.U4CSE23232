\# Notification System Design



\## Stage 1



\### REST API Endpoints



\#### 1. Get All Notifications

\- \*\*GET\*\* `/api/notifications`

\- \*\*Headers:\*\* `Authorization: Bearer <token>`

\- \*\*Response:\*\*

```json

{

&#x20; "notifications": \[

&#x20;   {

&#x20;     "id": "uuid",

&#x20;     "type": "Placement",

&#x20;     "message": "string",

&#x20;     "timestamp": "2026-04-22 17:51:30",

&#x20;     "isRead": false,

&#x20;     "studentId": "uuid"

&#x20;   }

&#x20; ]

}

```



\#### 2. Get Unread Notifications

\- \*\*GET\*\* `/api/notifications/unread`

\- \*\*Headers:\*\* `Authorization: Bearer <token>`

\- \*\*Response:\*\*

```json

{

&#x20; "unreadCount": 5,

&#x20; "notifications": \[]

}

```



\#### 3. Mark Notification as Read

\- \*\*PATCH\*\* `/api/notifications/:id/read`

\- \*\*Headers:\*\* `Authorization: Bearer <token>`

\- \*\*Response:\*\*

```json

{

&#x20; "success": true,

&#x20; "message": "Notification marked as read"

}

```



\#### 4. Get Notifications by Type

\- \*\*GET\*\* `/api/notifications?type=Placement`

\- \*\*Headers:\*\* `Authorization: Bearer <token>`



\#### 5. Send Notification (Admin)

\- \*\*POST\*\* `/api/notifications`

\- \*\*Headers:\*\* `Authorization: Bearer <token>`

\- \*\*Request Body:\*\*

```json

{

&#x20; "type": "Placement",

&#x20; "message": "string",

&#x20; "studentIds": \["uuid1", "uuid2"]

}

```



\### Real-time Mechanism

Use \*\*WebSockets\*\* (Socket.io) for real-time notification delivery to logged-in students.



\---



\## Stage 2



\### Recommended Database: PostgreSQL (Relational)



\*\*Reason:\*\* Notifications have structured data with relationships between students and notifications.



\### DB Schema



```sql

CREATE TABLE students (

&#x20; id UUID PRIMARY KEY,

&#x20; name VARCHAR(100),

&#x20; email VARCHAR(100) UNIQUE,

&#x20; created\_at TIMESTAMP DEFAULT NOW()

);



CREATE TABLE notifications (

&#x20; id UUID PRIMARY KEY,

&#x20; type VARCHAR(20) CHECK (type IN ('Placement', 'Event', 'Result')),

&#x20; message TEXT,

&#x20; timestamp TIMESTAMP DEFAULT NOW(),

&#x20; is\_read BOOLEAN DEFAULT FALSE,

&#x20; student\_id UUID REFERENCES students(id)

);

```



\### Problems at Scale (50,000 students, 5,000,000 notifications)

\- Slow queries without indexes

\- High memory usage

\- Table locks during bulk inserts



\### Solutions

\- Add indexes on frequently queried columns

\- Use pagination for fetching notifications

\- Archive old notifications to separate table



\---



\## Stage 3



\### Query Analysis



\*\*Original Query:\*\*

```sql

SELECT \* FROM notifications

WHERE studentID = 1042 AND isRead = false

ORDER BY createdAt DESC;

```



\*\*Why it's slow:\*\*

\- No index on `studentID` or `isRead`

\- `SELECT \*` fetches unnecessary columns

\- Full table scan on 5,000,000 rows



\*\*Optimized Query:\*\*

```sql

SELECT id, type, message, timestamp

FROM notifications

WHERE student\_id = 1042 AND is\_read = false

ORDER BY timestamp DESC

LIMIT 20;

```



\*\*Indexes to add:\*\*

```sql

CREATE INDEX idx\_student\_unread 

ON notifications(student\_id, is\_read, timestamp DESC);

```



\*\*Should we add indexes on every column?\*\*

No. Adding indexes on every column is bad because:

\- Slows down INSERT/UPDATE operations

\- Increases storage usage

\- Only index columns used in WHERE/ORDER BY clauses



\*\*Query: Placement notifications in last 7 days\*\*

```sql

SELECT \* FROM notifications

WHERE type = 'Placement'

AND timestamp >= NOW() - INTERVAL '7 days';

```



\---



\## Stage 4



\### Caching Strategy to Improve Performance



\*\*Problem:\*\* DB overwhelmed on every page load



\*\*Solution: Redis Caching\*\*



\- Cache unread notifications per student for 60 seconds

\- Invalidate cache when new notification arrives

\- Use pagination (20 notifications per page)



\*\*Tradeoffs:\*\*

| Strategy | Pro | Con |

|----------|-----|-----|

| Redis Cache | Fast reads | Slight staleness |

| Pagination | Less DB load | More API calls |

| CDN | Static content fast | Not for dynamic data |



\---



\## Stage 5



\### Problem with notify\_all implementation



\*\*Issues:\*\*

\- Sequential processing — slow for 50,000 students

\- If `send\_email` fails midway, remaining students don't get notified

\- No retry mechanism

\- Blocking operation



\*\*Redesigned Pseudocode:\*\*

