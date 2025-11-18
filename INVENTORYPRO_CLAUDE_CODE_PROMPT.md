# 🏭 Claude Code - Build InventoryPro MVP

## Complete Build Prompt for Inventory & Order Management System

Copy this entire prompt into Claude Code to build the complete InventoryPro application:

```
I need you to build a complete Inventory & Order Management desktop application called "InventoryPro" 
based on the specifications in InventoryPro_MVP_Spec.pdf. 

This should be built on the same foundation as the invoicing app (Electron + React + SQLite).

## Core Requirements

### Technology Stack
- Desktop: Electron (Windows, macOS, Linux)
- Frontend: React 18 with Tailwind CSS
- Database: SQLite with better-sqlite3
- Icons: Lucide React
- Charts: Recharts for analytics

### Database Schema

Create a comprehensive SQLite database with these core tables:

1. **products** - SKU, name, description, cost_price, sell_price, barcode, category, min_stock, reorder_point
2. **stock_levels** - product_id, warehouse_id, quantity, reserved_quantity, available_quantity
3. **warehouses** - name, address, city, state, zip, is_default
4. **customers** - name, company, email, phone, billing_address, shipping_address, credit_limit, payment_terms
5. **suppliers** - name, company, email, phone, address, payment_terms, lead_time_days, rating
6. **sales_orders** - order_number, customer_id, warehouse_id, order_date, required_date, status, subtotal, tax, shipping_cost, total
7. **sales_order_items** - order_id, product_id, quantity, unit_price, discount_percent, line_total, quantity_fulfilled
8. **purchase_orders** - po_number, supplier_id, warehouse_id, order_date, expected_date, status, subtotal, tax, total
9. **purchase_order_items** - po_id, product_id, quantity, unit_cost, line_total, quantity_received
10. **stock_movements** - product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, cost_per_unit, notes
11. **price_lists** - customer_tier, product_id, unit_price
12. **product_categories** - name, parent_id, description
13. **product_suppliers** - product_id, supplier_id, supplier_sku, cost_price, lead_time_days, is_preferred
14. **stock_adjustments** - product_id, warehouse_id, adjustment_qty, reason, notes
15. **goods_received** - po_id, received_date, received_by, notes
16. **goods_received_items** - gr_id, po_item_id, quantity_received, quality_check

Add proper indexes, foreign keys, and triggers for automatic calculations.

### Main Features to Build

#### 1. Product Management
- Product list with search, filter, sort
- Add/edit product form with:
  - SKU (auto-generate option)
  - Name, description, category
  - Cost price, sell price
  - Barcode generation
  - Min stock level, reorder point, reorder quantity
  - Multiple images
  - Supplier associations
- Bulk import from CSV/Excel
- Product variants (size, color, etc.)
- Category management

#### 2. Inventory Management
- Stock levels view (multi-warehouse)
- Stock by location
- Stock adjustments form
- Stock transfer between warehouses
- Low stock alerts (dashboard widget)
- Reorder suggestions
- Stock movement history
- Physical stock count mode

#### 3. Sales Order Management
- Sales order list with status tracking
- Create sales order form:
  - Customer selection
  - Product line items with drag-drop
  - Automatic stock reservation
  - Discount application
  - Tax calculation
  - Shipping cost
  - Order notes
- Order status: Draft, Confirmed, Picking, Packed, Shipped, Delivered
- Partial fulfillment support
- Generate pick list
- Generate packing slip
- Convert to invoice
- Print/PDF functionality

#### 4. Purchase Order Management
- Purchase order list
- Create PO form:
  - Supplier selection
  - Product line items
  - Expected delivery date
  - Warehouse destination
  - Notes
- PO status: Draft, Sent, Confirmed, Partial, Complete
- Email PO to supplier
- Goods receiving process:
  - Receive against PO
  - Partial receiving
  - Quality check notes
  - Auto-update stock
- PO history and tracking

#### 5. Customer Management
- Customer list with cards
- Add/edit customer form:
  - Company info
  - Contact details
  - Billing & shipping addresses
  - Credit limit
  - Payment terms
  - Customer tier (for pricing)
- Customer stats: total orders, revenue, outstanding
- Order history per customer

#### 6. Supplier Management
- Supplier list
- Add/edit supplier form:
  - Company details
  - Contact information
  - Payment terms
  - Lead time
  - Rating
- Supplier performance tracking
- Purchase history

#### 7. Dashboard & Reporting
- Dashboard with widgets:
  - Total inventory value
  - Low stock items count
  - Pending orders count
  - Today's shipments
  - Revenue charts
  - Top products
  - Recent activities
- Reports:
  - Stock valuation report
  - Sales by product/customer
  - Purchase by supplier
  - Stock movement report
  - Inventory aging
  - Profit margin analysis
- Export to CSV/Excel

#### 8. Settings
- Company information
- Warehouse management
- Tax rates
- Email configuration
- User management (roles & permissions)
- Backup/restore
- Data import/export

### UI/UX Requirements

- Modern, clean interface with Tailwind CSS
- Sidebar navigation with icons
- Search bars on all list views
- Filter and sort options
- Modal forms for add/edit
- Confirmation dialogs for delete
- Loading states
- Empty states with helpful messages
- Status badges with colors:
  - Draft: gray
  - Confirmed: blue
  - In Progress: yellow
  - Complete: green
  - Cancelled: red
- Responsive tables
- Print-friendly views

### Technical Requirements

1. Use the same Electron structure as invoicing app
2. Create database/schema.sql with all tables
3. Create database/db.js with all CRUD operations
4. Create IPC handlers in electron.js
5. Create preload.js bridge
6. Create React hooks for database access
7. Build all React components
8. Add barcode generation (using JsBarcode)
9. Add PDF generation for documents
10. Add CSV import/export
11. Error handling throughout
12. Loading states everywhere
13. Form validation

### Component Structure

src/
├── App.jsx (main app with routing)
├── components/
│   ├── Dashboard.jsx
│   ├── Products/
│   │   ├── ProductList.jsx
│   │   ├── ProductForm.jsx
│   │   └── ProductDetail.jsx
│   ├── Inventory/
│   │   ├── StockLevels.jsx
│   │   ├── StockAdjustment.jsx
│   │   ├── StockTransfer.jsx
│   │   └── StockHistory.jsx
│   ├── SalesOrders/
│   │   ├── SalesOrderList.jsx
│   │   ├── SalesOrderForm.jsx
│   │   ├── SalesOrderDetail.jsx
│   │   └── PickList.jsx
│   ├── PurchaseOrders/
│   │   ├── PurchaseOrderList.jsx
│   │   ├── PurchaseOrderForm.jsx
│   │   ├── PurchaseOrderDetail.jsx
│   │   └── GoodsReceiving.jsx
│   ├── Customers/
│   │   ├── CustomerList.jsx
│   │   └── CustomerForm.jsx
│   ├── Suppliers/
│   │   ├── SupplierList.jsx
│   │   └── SupplierForm.jsx
│   ├── Reports/
│   │   ├── ReportDashboard.jsx
│   │   ├── StockReport.jsx
│   │   ├── SalesReport.jsx
│   │   └── PurchaseReport.jsx
│   └── Settings/
│       ├── CompanySettings.jsx
│       ├── WarehouseSettings.jsx
│       └── UserSettings.jsx
└── hooks/
    └── useDatabase.js

### Priority Order

1. Database schema and operations (critical foundation)
2. Product management (core feature)
3. Inventory tracking (core feature)
4. Sales orders (revenue generation)
5. Purchase orders (supply management)
6. Customers & Suppliers (relationship management)
7. Dashboard & Reports (business intelligence)
8. Settings (configuration)

### Key Business Logic

1. **Stock Reservation**: When SO is confirmed, reserve stock (reduce available_quantity)
2. **Stock Updates**: When SO is fulfilled, reduce actual quantity
3. **Purchase Receiving**: Update stock levels when goods received
4. **Reorder Alerts**: Check min_stock vs available_quantity
5. **Price Calculation**: Apply customer tier pricing if exists
6. **Cost Tracking**: Track cost per unit in stock_movements
7. **Stock Valuation**: Calculate using FIFO method

### Testing Checklist

- [ ] Create product and check it appears in list
- [ ] Adjust stock and verify stock_movements recorded
- [ ] Create sales order and verify stock reserved
- [ ] Fulfill order and verify stock reduced
- [ ] Create purchase order
- [ ] Receive goods and verify stock increased
- [ ] Check low stock alerts trigger
- [ ] Verify reports show correct data
- [ ] Test multi-warehouse operations
- [ ] Import CSV data successfully
- [ ] Export reports to CSV
- [ ] Print documents (SO, PO, Pick List)

Please build this complete system now, ensuring:
- Clean, professional code
- Comprehensive error handling
- Loading states everywhere
- Proper form validation
- Responsive design
- Print-friendly documents
- Fast performance (handles 10,000+ products)
```

## After Building

1. Test all core workflows
2. Import sample data
3. Generate test orders
4. Verify reports
5. Test backup/restore
6. Build for all platforms

## Expected Deliverables

- Complete Electron + React app
- SQLite database with 15+ tables
- 30+ React components
- Full CRUD operations
- Dashboard with charts
- PDF generation
- CSV import/export
- Professional UI with Tailwind

