Create a complete modern SaaS-style web UI design for an internal company system called **Employee Commission Calculator System**.

This system is used by HR and sales administrators to manage sales invoices, validate sales transactions, detect sales below bottom price, and calculate employee commissions.

The UI should be designed as a professional admin dashboard suitable for internal company use.

Use a **clean, modern SaaS dashboard style** with light theme, rounded cards, soft shadows, and clear spacing.

Design the interface so it can easily be implemented using **React and Tailwind CSS**.

Typography:
Use a modern sans-serif font such as Inter.

Color palette:
Primary color: blue
Success color: green
Warning color: orange
Danger color: red
Background color: light gray

Use minimal icons and modern UI components.

---

GLOBAL LAYOUT STRUCTURE

The main application layout should include:

Left Sidebar Navigation
Top Navigation Bar
Main Content Area

Sidebar menu items:

Dashboard
Invoices
Invoice Validation
Commission Reports
Product Price List
Users Management
Settings

Topbar components:

Global search bar
Notification icon
User profile dropdown menu

---

PAGE 1 — LOGIN PAGE

Design a split screen login layout.

Left side:
Company branding area including:

System title: Employee Commission Calculator
Short description:
"Internal system for managing sales invoices and employee commission calculations."

Include a modern illustration related to analytics, dashboards, or business data.

Right side:
Centered login form card with rounded corners and soft shadow.

Login form fields:

Email
Password

Components:

Login button
Remember me checkbox
Forgot password link

Below the login button include:

"Authorized personnel only"

The page should feel modern and professional.

---

PAGE 2 — DASHBOARD

Create a dashboard overview page with KPI cards.

KPI Cards:

Total Sales Today
Total Invoices Today
Pending Invoice Validation
Total Commission This Month

Below the KPI cards include:

A sales performance chart showing daily sales
A table displaying latest invoices

Table columns:

Invoice Number
Sales Team
Total Sales
Status
Date

---

PAGE 3 — INVOICE LIST PAGE

Create a table layout showing all invoices.

Include filters at the top:

Search by invoice number
Filter by team (Lelang / Shopee)
Filter by date
Filter by status

Table columns:

Invoice Number
Team
Total Sales
Created By
Status
Date
Actions

Actions include:

View
Edit
Delete

---

PAGE 4 — CREATE INVOICE PAGE

Design a form layout for entering a new invoice.

Fields:

Invoice Number
Date
Sales Team (Lelang / Shopee)
Customer Name

Below the form create an **Add Item section**.

Items table columns:

Product Name
Quantity
Price
Subtotal
Bottom Price Warning Indicator

Include buttons:

Add Item
Remove Item
Submit Invoice

Show a visual warning indicator if the item price is below bottom price.

---

PAGE 5 — INVOICE VALIDATION PAGE

Admin validation interface.

Create a table displaying invoices that need approval.

Table columns:

Invoice Number
Team
Total Sales
Bottom Price Warning
Submitted By
Date
Actions

Actions:

Approve
Reject
View Details

Highlight rows that contain bottom price warnings.

---

PAGE 6 — COMMISSION REPORT PAGE

Create a report table showing employee commissions.

Table columns:

Sales Team
Total Sales
Commission Percentage
Commission Amount
Status
Date

Include filters:

Daily
Weekly
Monthly

Add export button:

Export to Excel

---

PAGE 7 — PRODUCT PRICE LIST PAGE

Create a product list table.

Table columns:

SKU
Product Name
Bottom Price
Last Updated

Add a button:

Import Excel

Also include:

Add Product
Edit Product
Delete Product

---

PAGE 8 — USERS MANAGEMENT PAGE

User management interface.

Table columns:

Name
Email
Role
Team
Status
Actions

Roles:

Super Admin
Admin
User

Teams:

Lelang
Shopee

Actions:

Edit
Deactivate
Delete

---

PAGE 9 — SETTINGS PAGE

System configuration page including:

Commission rules
Default commission percentage
Price list upload
System preferences

Use a clean card-based layout.

---

DESIGN STYLE GUIDELINES

Use a modern SaaS dashboard layout.

Components should include:

Sidebar navigation
Top navigation bar
KPI cards
Data tables
Charts
Form layouts
Modal dialogs

Design should feel similar to professional admin dashboards used in ERP or HR systems.

Use consistent spacing, modern UI patterns, and clear visual hierarchy.

The design should be responsive and suitable for desktop-first web applications.

Ensure the structure can easily be converted into a React + Tailwind dashboard application.
