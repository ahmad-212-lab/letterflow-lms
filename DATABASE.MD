# Letter Management System Database Design

---

# Main Tables

## 1. users

| Field | Type | Description |
|------|------|-------------|
| id | BIGINT | Primary Key |
| name | VARCHAR(255) | Full Name |
| email | VARCHAR(255) | User Email |
| password | VARCHAR(255) | Encrypted Password |
| role_id | BIGINT | User Role |
| department_id | BIGINT | Department |
| status | ENUM | Active/Inactive |
| created_at | TIMESTAMP | Created Date |

---

## 2. roles

| Field | Type |
|------|------|
| id | BIGINT |
| name | VARCHAR(100) |
| permissions | TEXT |

Examples:
- Admin
- Manager
- Clerk
- Viewer

---

## 3. departments

| Field | Type |
|------|------|
| id | BIGINT |
| name | VARCHAR(255) |
| description | TEXT |

---

## 4. letters

| Field | Type | Description |
|------|------|-------------|
| id | BIGINT | Primary Key |
| reference_no | VARCHAR(100) | Unique Number |
| title | VARCHAR(255) | Letter Subject |
| description | TEXT | Content |
| type | ENUM | Incoming/Outgoing/Internal |
| sender | VARCHAR(255) | Sender Name |
| recipient | VARCHAR(255) | Recipient |
| department_id | BIGINT | Department |
| status | ENUM | Draft/Pending/Approved |
| priority | ENUM | Low/Medium/High |
| attachment | VARCHAR(255) | File Path |
| created_by | BIGINT | User ID |
| approved_by | BIGINT | Approver ID |
| created_at | TIMESTAMP | Created Date |

---

## 5. workflows

| Field | Type |
|------|------|
| id | BIGINT |
| letter_id | BIGINT |
| sender_id | BIGINT |
| receiver_id | BIGINT |
| action | VARCHAR(100) |
| comment | TEXT |
| status | ENUM |
| created_at | TIMESTAMP |

---

## 6. notifications

| Field | Type |
|------|------|
| id | BIGINT |
| user_id | BIGINT |
| title | VARCHAR(255) |
| message | TEXT |
| is_read | BOOLEAN |
| created_at | TIMESTAMP |

---

## 7. audit_logs

| Field | Type |
|------|------|
| id | BIGINT |
| user_id | BIGINT |
| action | VARCHAR(255) |
| table_name | VARCHAR(255) |
| record_id | BIGINT |
| created_at | TIMESTAMP |

---

# Relationships

## users
- belongsTo roles
- belongsTo departments

## letters
- belongsTo departments
- belongsTo users

## workflows
- belongsTo letters
- belongsTo users

## notifications
- belongsTo users

---

# ER Diagram Summary

Users ---- Roles
Users ---- Departments
Letters ---- Departments
Letters ---- Users
Workflows ---- Letters
Workflows ---- Users

---

# Recommended Indexes

- reference_no
- status
- created_at
- department_id
- user_id

---

# Database Security
- Encrypt passwords
- Use prepared statements
- Enable backups
- Add activity logs
- Apply role permissions

---

# Suggested Database Engine
- MySQL 8+
- PostgreSQL 14+