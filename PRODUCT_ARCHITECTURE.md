# Product Architecture - 3-Product Strategy

## Business Model Overview

### Three Product Offerings:

1. **InvoicePro** - $299 (Standalone invoicing & billing)
2. **InventoryPro** - $500 (Standalone inventory & order management)
3. **Business Suite** - $699 (Integrated bundle - save $100)

---

## Technical Architecture

### Option A: Separate Applications (Recommended for MVP)

#### InvoicePro (Standalone)
- **Database**: `invoicepro.db` (SQLite)
- **Tables**: 17 tables (clients, invoices, payments, estimates, etc.)
- **Features**: Invoicing, estimates, payments, recurring invoices, reminders
- **Launch**: Separate Electron app
- **Data**: Self-contained

#### InventoryPro (Standalone)
- **Database**: `inventorypro.db` (SQLite)
- **Tables**: 16 tables (products, stock, orders, warehouses, suppliers, etc.)
- **Features**: Inventory, sales orders, purchase orders, multi-warehouse
- **Launch**: Separate Electron app
- **Data**: Self-contained

#### Business Suite (Integrated Bundle)
- **Database**: `businesssuite.db` (SQLite with all tables)
- **Tables**: Combined schema (30+ tables)
- **Features**: All InvoicePro + InventoryPro features
- **Integration Points**:
  - Shared customer database
  - Convert sales orders → invoices
  - Track inventory → invoice line items
  - Unified reporting dashboard
- **Launch**: Single Electron app with all features enabled

---

## Integration Strategy

### Shared Data Entities

When running as **Business Suite**, these entities are shared:

1. **Customers/Clients** - Single customer table used by both
2. **Products** - Inventory products link to invoice line items
3. **Invoices** - Can be generated from sales orders
4. **Payments** - Track payments against orders and invoices

### Data Sync (For Standalone → Bundle Migration)

If a user has both standalone products and wants to migrate to bundle:

```
Migration Tool:
1. Read from invoicepro.db
2. Read from inventorypro.db
3. Merge into businesssuite.db
4. Handle duplicate customers (merge by email)
5. Link historical data
6. Export old databases as backup
```

---

## Database Schema Strategy

### InvoicePro Tables (17 tables)
```
settings, clients, invoices, invoice_items, payments,
recurring_invoices, recurring_invoice_items, estimates,
estimate_items, credit_notes, credit_note_items, saved_items,
reminder_templates, invoice_reminders, users, sessions, audit_log
```

### InventoryPro Tables (16 tables)
```
settings_inventory, products, stock_levels, warehouses,
customers_inventory, suppliers, sales_orders, sales_order_items,
purchase_orders, purchase_order_items, stock_movements,
price_lists, product_categories, product_suppliers,
stock_adjustments, goods_received, goods_received_items
```

### Business Suite Tables (Merged)
```
All InvoicePro tables +
All InventoryPro tables with different names +
Integration tables:
  - customer_mapping (links clients ↔ customers_inventory)
  - order_invoice_mapping (links sales_orders → invoices)
  - product_saved_item_mapping (links products → saved_items)
```

---

## Code Structure

```
/projects
  /InvoicePro/           - Standalone invoicing app
    /database
      invoicepro-schema.sql
      invoicepro-db.js
    /src
      /components (invoicing features)
    electron.js
    package.json

  /InventoryPro/         - Standalone inventory app
    /database
      inventorypro-schema.sql
      inventorypro-db.js
    /src
      /components (inventory features)
    electron.js
    package.json

  /BusinessSuite/        - Integrated bundle
    /database
      businesssuite-schema.sql
      businesssuite-db.js
      integration-bridge.js
    /src
      /components
        /invoicing (imported from InvoicePro)
        /inventory (imported from InventoryPro)
        /integration (unique to suite)
    electron.js
    package.json

  /shared/               - Common components
    /ui-components
    /utils
    /hooks
```

---

## Integration Features (Business Suite Only)

### 1. Sales Order → Invoice Conversion
```javascript
// When user clicks "Convert to Invoice" on a sales order
- Copy order details to new invoice
- Link invoice to original order
- Copy line items with pricing
- Update order status to "Invoiced"
- Track payment against both order and invoice
```

### 2. Inventory-Aware Invoicing
```javascript
// When creating invoice from Business Suite
- Show real-time stock levels per product
- Warn if invoicing more than available stock
- Auto-reserve inventory when invoice created
- Update stock when invoice marked as fulfilled
```

### 3. Unified Customer Management
```javascript
// Single customer record used by both systems
- Customer orders (from InventoryPro)
- Customer invoices (from InvoicePro)
- Combined payment history
- Total customer value (orders + invoices)
```

### 4. Integrated Reporting
```javascript
// Reports that span both systems
- Revenue report (invoices + orders)
- Customer profitability (all transactions)
- Inventory valuation + accounts receivable
- Cash flow forecast (orders, invoices, payments)
```

---

## Pricing & Licensing Strategy

### License Models

1. **InvoicePro License** - $299
   - Activate with: `INVOICE-XXXX-XXXX-XXXX`
   - Enables: Invoicing features only
   - Database: `invoicepro.db`

2. **InventoryPro License** - $500
   - Activate with: `INVENTORY-XXXX-XXXX-XXXX`
   - Enables: Inventory features only
   - Database: `inventorypro.db`

3. **Business Suite License** - $699
   - Activate with: `SUITE-XXXX-XXXX-XXXX`
   - Enables: All features + integrations
   - Database: `businesssuite.db`

4. **Upgrade Paths**:
   - InvoicePro → Suite: $400 (pay difference)
   - InventoryPro → Suite: $199 (pay difference)
   - Both standalone → Suite: $699 (includes migration)

---

## Development Phases

### Phase 1: Build InventoryPro Standalone ✅ (Current)
- Complete inventory management system
- 16 tables, 30+ components
- Fully functional standalone product
- Price: $500

### Phase 2: Verify InvoicePro Standalone
- Already have schema (17 tables)
- Ensure it works as standalone
- Package as separate product
- Price: $299

### Phase 3: Build Business Suite
- Merge schemas with integration tables
- Build bridge components
- Add integration features
- Create unified UI
- Price: $699

### Phase 4: Build Migration Tools
- Standalone → Suite migration
- Data export/import
- Customer merge tools

---

## Marketing Positioning

### InvoicePro ($299)
**For**: Freelancers, consultants, service businesses
**Need**: Professional invoicing without inventory
**Tagline**: "Professional invoicing made simple"

### InventoryPro ($500)
**For**: Product-based businesses, retailers, distributors
**Need**: Inventory tracking and order management
**Tagline**: "Complete inventory control"

### Business Suite ($699)
**For**: Growing businesses needing both
**Need**: End-to-end business management
**Tagline**: "Complete business management suite"
**Savings**: $100 vs buying separately

---

## Technical Benefits of This Architecture

✅ **Code Reuse**: Shared components between all products
✅ **Separate Testing**: Each product tested independently
✅ **Clear Separation**: No feature bloat in standalone products
✅ **Easy Migration**: Users can upgrade smoothly
✅ **Flexible Pricing**: Multiple entry points for customers
✅ **Reduced Complexity**: Standalone products simpler to support
✅ **Market Segmentation**: Different products for different needs

---

## Next Steps

1. Build InventoryPro as standalone (current task)
2. Test InvoicePro standalone
3. Design integration bridge
4. Build Business Suite
5. Create migration tools
6. Package all three products
7. Launch with tiered pricing

---

## File Structure for All Products

```
/Sales-and-inventory-/
  /products/
    /InvoicePro/
    /InventoryPro/
    /BusinessSuite/
  /shared/
    /components/
    /utils/
    /database-helpers/
  /docs/
    PRODUCT_ARCHITECTURE.md (this file)
    INVOICEPRO_README.md
    INVENTORYPRO_README.md
    BUSINESSSUITE_README.md
```

---

**This architecture gives you maximum flexibility while minimizing development effort through code reuse.**
