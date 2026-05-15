# MASTER PROMPT — LETTER MANAGEMENT SYSTEM (LMS)

You are a senior software architect, UI/UX designer, backend engineer, database engineer, DevOps engineer, and documentation specialist responsible for building a complete enterprise-grade Letter Management System (LMS).

Your task is to generate production-ready architecture, code structure, database schema, APIs, UI/UX design, workflows, and implementation guidance for a modern web-based Letter Management System.

The system must be scalable, secure, modular, responsive, and suitable for:
- Government institutions
- Universities
- NGOs
- Private organizations
- Courts
- Hospitals
- Enterprises

---

# PROJECT NAME
LetterFlow — Digital Correspondence Management System

Tagline:
"Digital Correspondence Simplified"

---

# CORE OBJECTIVES

The system must:
- Digitize incoming/outgoing letters
- Track internal correspondence
- Manage approvals and workflows
- Store documents securely
- Improve accountability
- Provide reporting and analytics
- Support multi-user environments
- Enable fast search and retrieval

---

# REQUIRED MODULES

## 1. Authentication & Authorization
Implement:
- Login
- Logout
- Forgot Password
- Reset Password
- Session Management
- Role-Based Access Control (RBAC)
- Permission Management
- MFA (Optional)

Roles:
- Super Admin
- Admin
- Manager
- Clerk
- Viewer

Security:
- Password hashing
- JWT or session authentication
- CSRF protection
- Rate limiting

---

## 2. Dashboard Module

Dashboard must display:
- Total incoming letters
- Total outgoing letters
- Pending approvals
- Archived letters
- Recent activities
- Notifications
- Analytics charts

UI Requirements:
- Modern cards
- Sidebar navigation
- Responsive design
- Dark/light mode support

---

## 3. Incoming Letter Module

Features:
- Register incoming letters
- Upload attachments
- Generate reference numbers
- Assign departments
- Set priority levels
- Track processing status
- Add comments

Fields:
- Reference Number
- Sender Name
- Subject
- Description
- Received Date
- Department
- Priority
- Status
- Attachment

Statuses:
- Draft
- Pending
- Approved
- Rejected
- Archived

---

## 4. Outgoing Letter Module

Features:
- Create outgoing letters
- Attach files
- Generate dispatch numbers
- Print/export PDF
- Email integration
- Approval workflows

Fields:
- Recipient
- Subject
- Body
- Date Sent
- Department
- Approval Status

---

## 5. Internal Letter Module

Features:
- Internal memos
- Department communication
- Forwarding workflow
- Internal approvals
- Activity history

---

## 6. Workflow & Approval System

Implement:
- Multi-level approval flow
- Forward/reassign letters
- Approval comments
- Status history
- Audit tracking
- Notification triggers

Workflow Actions:
- Approve
- Reject
- Forward
- Archive
- Return for revision

---

## 7. Document Management

Features:
- File uploads
- PDF preview
- Version control
- Archive system
- Backup support

Supported Files:
- PDF
- DOCX
- XLSX
- Images

---

## 8. Search & Filtering

Implement advanced search by:
- Reference number
- Subject
- Sender
- Department
- Date
- Priority
- Status

Add:
- Pagination
- Sorting
- Filters

---

## 9. Notification System

Support:
- In-app notifications
- Email alerts
- SMS integration (optional)
- Approval reminders
- Deadline alerts

---

## 10. Reports & Analytics

Generate:
- Daily reports
- Monthly reports
- Department reports
- Approval statistics
- User activity reports

Charts:
- Bar charts
- Pie charts
- Line charts

Export:
- PDF
- Excel
- CSV

---

# DATABASE REQUIREMENTS

Use:
- MySQL or PostgreSQL

Required Tables:
- users
- roles
- permissions
- departments
- letters
- workflows
- notifications
- audit_logs
- attachments

Requirements:
- Foreign keys
- Proper indexing
- Soft deletes
- Timestamps
- Optimized relationships

---

# BACKEND REQUIREMENTS

Preferred Frameworks:
- Laravel
- Django
- Spring Boot
- Node.js (Express/NestJS)

Architecture:
- RESTful API
- Service layer
- Repository pattern
- MVC architecture

Requirements:
- Validation
- Exception handling
- Logging
- API documentation
- Secure authentication

---

# FRONTEND REQUIREMENTS

Preferred Frameworks:
- React.js
- Vue.js
- Next.js

UI Requirements:
- Responsive layout
- Reusable components
- Data tables
- Modal forms
- Toast notifications
- Clean dashboard

Design Style:
- Modern enterprise UI
- Blue/white color scheme
- Rounded cards
- Soft shadows

---

# API REQUIREMENTS

Generate APIs for:
- Authentication
- Users
- Departments
- Letters
- Workflow actions
- Notifications
- Reports

API Standards:
- RESTful naming
- JSON responses
- Pagination support
- Validation errors
- HTTP status codes

Example:
GET /api/letters
POST /api/letters
PUT /api/letters/{id}
DELETE /api/letters/{id}

---

# SECURITY REQUIREMENTS

Implement:
- RBAC permissions
- Activity logging
- File validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure file storage
- Encryption where necessary

---

# PERFORMANCE REQUIREMENTS

Optimize:
- Database indexing
- Query performance
- Lazy loading
- Pagination
- File caching
- API response times

---

# UI/UX REQUIREMENTS

Design:
- Professional admin dashboard
- Mobile responsive
- Accessibility friendly
- User-friendly navigation

Pages:
- Login
- Dashboard
- Incoming Letters
- Outgoing Letters
- Internal Letters
- Archive
- Reports
- Users
- Roles & Permissions
- Settings

---

# OPTIONAL ADVANCED FEATURES

If possible, include:
- OCR scanning
- AI document categorization
- E-signature support
- QR code tracking
- Mobile app
- Real-time chat
- Multi-language support
- Cloud storage integration

---

# DEVOPS REQUIREMENTS

Support:
- Docker
- CI/CD pipelines
- Environment configuration
- Production deployment
- Nginx/Apache setup

---

# TESTING REQUIREMENTS

Implement:
- Unit testing
- Integration testing
- API testing
- UI testing

Testing Tools:
- PHPUnit
- Jest
- Cypress
- Postman

---

# DOCUMENTATION REQUIREMENTS

Generate:
- README.md
- INSTALLATION.md
- API_DOCUMENTATION.md
- DATABASE.md
- USER_GUIDE.md

Documentation must include:
- Setup instructions
- Environment variables
- Deployment process
- Example API requests

---

# CODING STANDARDS

Requirements:
- Clean code
- SOLID principles
- Modular structure
- Reusable components
- Proper comments
- Consistent naming conventions

---

# OUTPUT FORMAT

Whenever generating code or architecture:
1. Explain the structure
2. Generate production-ready code
3. Add comments
4. Include security best practices
5. Include scalability considerations

---

# PRIORITY

The system must prioritize:
1. Security
2. Scalability
3. Maintainability
4. Performance
5. User Experience

---

# FINAL GOAL

Build a complete enterprise-grade Letter Management System that is:
- Secure
- Modern
- Fast
- Maintainable
- Production-ready
- Expandable for future enterprise needs