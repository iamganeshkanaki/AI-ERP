# Nexus AI ERP — Enterprise Django REST Framework Backend

Production-ready, modular Django REST Framework (DRF) backend for **Nexus AI ERP**, built with enterprise Python, PostgreSQL, role-based access control (RBAC), domain-driven service architecture, and deep AI copilot integration.

---

## Architecture Overview

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── config/
│   ├── settings/
│   │   ├── base.py            # Core settings, apps, middleware, JWT & DRF config
│   │   ├── local.py           # Development config with debug tools & SQLite/PG
│   │   └── production.py      # Production hardening, SSL, static storage
│   ├── urls.py                # Master API router for all ERP apps
│   ├── wsgi.py                # WSGI deployment entry point
│   └── asgi.py                # ASGI asynchronous / WebSocket entry point
│
└── apps/
    ├── core/                  # Base abstract models, audit tracking, permissions, pagination
    ├── authentication/        # SimpleJWT tokens (obtain, refresh, blacklist, /me)
    ├── users/                 # Custom User model, Company, Branch, Department, Employee
    ├── crm/                   # Customers, Leads, Opportunities, pipeline analytics
    ├── sales/                 # Sales Orders, Order Items, Delivery Notes, credit check
    ├── purchase/              # Vendors, Purchase Orders, Goods Receipt (GRN)
    ├── inventory/             # Warehouses, Categories, Products, Stock, Movements
    ├── finance/               # Chart of Accounts, Invoices, AP Bills, Payments, General Ledger
    ├── hr/                    # Attendance, Leave requests, Payroll, Expense claims
    ├── projects/              # Projects, Milestones, Work breakdown tasks
    ├── assets/                # Fixed capital assets, maintenance logs
    ├── service/               # Support tickets, warranty tracking
    ├── reports/               # Executive dashboard KPIs, Action Center data
    ├── notifications/         # Real-time event notifications & alerts
    ├── approvals/             # Multi-tier authorization queues
    ├── documents/             # Enterprise encrypted document vault
    └── ai/                    # Nexus Copilot triage, live tool execution & audit trail
```

---

## Key ERP Business Workflows Implemented

1. **Order-to-Cash (O2C)**:
   `Customer` ➔ `Sales Order` (with credit-limit verification) ➔ `Delivery Note` ➔ `Sales Invoice` ➔ `Payment` ➔ Automated `General Ledger` double entry.

2. **Procure-to-Pay (P2P)**:
   `Vendor` ➔ `Purchase Order` (with approval threshold rules) ➔ `Goods Receipt (GRN)` (updates warehouse stock directly) ➔ `Vendor Bill` ➔ `Payment Disbursement`.

3. **Multi-Tier Approvals & Action Center**:
   Centralized queue for high-value orders, discount exceptions, and leave/expense requests with full audit history.

4. **Nexus AI Agent**:
   Autonomous tool execution layer allowing natural language queries to inspect inventory stock levels, customer credit, pending approvals, and executive KPIs with strict role verification and audit logging.

---

## Prerequisites

- **Python**: 3.10+ or 3.11+
- **PostgreSQL**: 14+ (or SQLite for initial local development)
- **pip** & **virtualenv**

---

## Local Setup & Quickstart

### 1. Clone & create virtual environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
Copy the template file:
```bash
cp .env.example .env
```
Ensure your PostgreSQL credentials in `.env` are configured:
```env
DATABASE_URL=postgres://erp_user:secure_password@localhost:5432/nexus_erp_db
SECRET_KEY=your-production-secure-django-secret-key
DJANGO_SETTINGS_MODULE=config.settings.local
```

### 4. Run database migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Seed master enterprise demonstration data
```bash
python manage.py seed_erp_data
```
This populates:
- Organization structure: Apex Globals Corp, Branches & Departments
- Demo Users:
  - `admin@apexglobals.com` (Password: `AdminPass123!`)
  - `executive@apexglobals.com` (Password: `ExecPass123!`)
  - `sales@apexglobals.com` (Password: `SalesPass123!`)
  - `purchase@apexglobals.com` (Password: `PurchasePass123!`)
- Master Chart of Accounts, Categories, Products & Warehouses
- Low stock items, pending approval queues, and customer records.

### 6. Start the development server
```bash
python manage.py runserver 0.0.0.0:8000
```
- API Root: `http://localhost:8000/api/`
- Admin Dashboard: `http://localhost:8000/admin/`

---

## Running Test Suites

Every domain app includes comprehensive automated test suites for business logic:
```bash
python manage.py test apps.authentication apps.crm apps.sales apps.purchase apps.inventory apps.finance apps.hr
```

---

## Role-Based Access Control (RBAC) Matrix

| Role | CRM & Sales | Procurement | Inventory | Finance & GL | HR & Payroll | Approvals |
|------|:-----------:|:-----------:|:---------:|:------------:|:------------:|:---------:|
| **Admin** | Full | Full | Full | Full | Full | Full |
| **Executive** | Read / Approve | Read / Approve | Read | Full Read / Approve | Full Read / Approve | Full Approve |
| **Sales** | Full CRUD | View | View | View AR / Invoices | Self | Submit |
| **Purchase** | View | Full CRUD | Inward / View | View AP / Bills | Self | Submit |
| **Inventory** | View | View POs | Full CRUD | View Stock Value | Self | Submit |
| **Finance** | View Invoices | View Bills | View | Full CRUD | View Payroll | Approve |
| **HR** | - | - | - | View Payroll | Full CRUD | Approve |
