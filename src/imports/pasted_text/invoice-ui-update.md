Update the UI design for the **Employee Commission Calculator System** admin dashboard.

This system is used internally by HR and sales administrators to manage invoices and calculate employee commissions.

Modify the Invoice related pages so that invoices are associated with both **Sales Team and User Name**.

Each invoice must display the name of the user who created or is responsible for the invoice.

---

INVOICE LIST PAGE

Update the invoice table layout to include a **User Name** column.

Filters at the top:

Search by invoice number
Filter by team (Lelang / Shopee)
Filter by user name
Filter by date
Filter by status

Table columns:

Invoice Number
User Name
Sales Team
Customer Name
Total Sales
Status
Date
Actions

Actions include:

View
Edit
Delete

---

CREATE INVOICE PAGE

Add a field showing the **User Name** associated with the invoice.

Fields:

Invoice Number
Date
Sales Team (Lelang / Shopee)
User Name (dropdown or auto-filled based on logged-in user)
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

If the price is below the bottom price, show a warning indicator.

---

INVOICE DETAIL PAGE

Create a detailed invoice view layout.

Invoice information section:

Invoice Number
User Name
Sales Team
Customer Name
Date
Invoice Status

Items table:

Product Name
Quantity
Price
Subtotal
Warning Status

Show total sales at the bottom.

---

INVOICE VALIDATION PAGE

Update the validation table to include **User Name**.

Table columns:

Invoice Number
User Name
Sales Team
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

Design style must remain consistent with the modern SaaS dashboard style.

Use clean spacing, rounded cards, soft shadows, and clear typography.
Ensure the design is compatible with React + Tailwind dashboard implementation.
