-- ============================================================================
-- INVENTORYPRO DATABASE SCHEMA
-- Complete Inventory & Order Management System
-- Version: 1.0.0
-- ============================================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- 1. SETTINGS - Application configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    company_name TEXT NOT NULL DEFAULT 'Your Company',
    company_email TEXT DEFAULT '',
    company_phone TEXT DEFAULT '',
    company_address TEXT DEFAULT '',
    company_city TEXT DEFAULT '',
    company_state TEXT DEFAULT '',
    company_zip TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    currency_symbol TEXT DEFAULT '$',
    tax_rate REAL DEFAULT 0.0,
    default_payment_terms TEXT DEFAULT 'Net 30',
    low_stock_threshold INTEGER DEFAULT 10,
    enable_barcode_scanning INTEGER DEFAULT 1,
    enable_multi_warehouse INTEGER DEFAULT 1,
    stock_valuation_method TEXT DEFAULT 'FIFO' CHECK(stock_valuation_method IN ('FIFO', 'LIFO', 'AVERAGE')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (id) VALUES (1);

-- ============================================================================
-- 2. WAREHOUSES - Multiple warehouse/location management
-- ============================================================================
CREATE TABLE IF NOT EXISTS warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    zip TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    manager_name TEXT DEFAULT '',
    is_default INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create default warehouse
INSERT OR IGNORE INTO warehouses (id, name, code, is_default)
VALUES (1, 'Main Warehouse', 'MAIN', 1);

-- Index for warehouse lookups
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_active ON warehouses(active);

-- ============================================================================
-- 3. PRODUCT_CATEGORIES - Organize products into categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id);

-- ============================================================================
-- 4. PRODUCTS - Main product catalog
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category_id INTEGER,
    barcode TEXT DEFAULT '',
    cost_price REAL DEFAULT 0.0,
    sell_price REAL DEFAULT 0.0,
    min_stock_level INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    unit_of_measure TEXT DEFAULT 'pcs',
    weight REAL DEFAULT 0.0,
    dimensions TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    active INTEGER DEFAULT 1,
    track_inventory INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- ============================================================================
-- 5. STOCK_LEVELS - Track stock by product and warehouse
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    quantity REAL DEFAULT 0.0,
    reserved_quantity REAL DEFAULT 0.0,
    available_quantity REAL GENERATED ALWAYS AS (quantity - reserved_quantity) VIRTUAL,
    bin_location TEXT DEFAULT '',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    UNIQUE(product_id, warehouse_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON stock_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse ON stock_levels(warehouse_id);

-- ============================================================================
-- 6. SUPPLIERS - Supplier management
-- ============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_code TEXT UNIQUE,
    company_name TEXT NOT NULL,
    contact_name TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    zip TEXT DEFAULT '',
    payment_terms TEXT DEFAULT 'Net 30',
    lead_time_days INTEGER DEFAULT 7,
    rating INTEGER DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
    notes TEXT DEFAULT '',
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active);

-- ============================================================================
-- 7. PRODUCT_SUPPLIERS - Link products to suppliers with pricing
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    supplier_id INTEGER NOT NULL,
    supplier_sku TEXT DEFAULT '',
    cost_price REAL DEFAULT 0.0,
    lead_time_days INTEGER DEFAULT 7,
    min_order_qty INTEGER DEFAULT 1,
    is_preferred INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    UNIQUE(product_id, supplier_id)
);

CREATE INDEX IF NOT EXISTS idx_product_suppliers_product ON product_suppliers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_supplier ON product_suppliers(supplier_id);

-- ============================================================================
-- 8. CUSTOMERS - Customer management
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_code TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    company_name TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    billing_address TEXT DEFAULT '',
    billing_city TEXT DEFAULT '',
    billing_state TEXT DEFAULT '',
    billing_zip TEXT DEFAULT '',
    shipping_address TEXT DEFAULT '',
    shipping_city TEXT DEFAULT '',
    shipping_state TEXT DEFAULT '',
    shipping_zip TEXT DEFAULT '',
    payment_terms TEXT DEFAULT 'Net 30',
    credit_limit REAL DEFAULT 0.0,
    customer_tier TEXT DEFAULT 'Standard' CHECK(customer_tier IN ('Standard', 'Silver', 'Gold', 'Platinum')),
    notes TEXT DEFAULT '',
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(active);

-- ============================================================================
-- 9. SALES_ORDERS - Sales order headers
-- ============================================================================
CREATE TABLE IF NOT EXISTS sales_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    required_date TEXT,
    status TEXT DEFAULT 'Draft' CHECK(status IN ('Draft', 'Confirmed', 'Picking', 'Packed', 'Shipped', 'Delivered', 'Cancelled')),
    subtotal REAL DEFAULT 0.0,
    tax_rate REAL DEFAULT 0.0,
    tax_amount REAL DEFAULT 0.0,
    shipping_cost REAL DEFAULT 0.0,
    discount_type TEXT DEFAULT 'none' CHECK(discount_type IN ('none', 'percentage', 'fixed')),
    discount_value REAL DEFAULT 0.0,
    discount_amount REAL DEFAULT 0.0,
    total REAL DEFAULT 0.0,
    notes TEXT DEFAULT '',
    internal_notes TEXT DEFAULT '',
    shipping_method TEXT DEFAULT '',
    tracking_number TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_warehouse ON sales_orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(order_date);

-- ============================================================================
-- 10. SALES_ORDER_ITEMS - Line items for sales orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS sales_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sales_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL DEFAULT 0.0,
    discount_percent REAL DEFAULT 0.0,
    discount_amount REAL DEFAULT 0.0,
    line_total REAL DEFAULT 0.0,
    quantity_fulfilled REAL DEFAULT 0.0,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_order ON sales_order_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_product ON sales_order_items(product_id);

-- ============================================================================
-- 11. PURCHASE_ORDERS - Purchase order headers
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    expected_date TEXT,
    status TEXT DEFAULT 'Draft' CHECK(status IN ('Draft', 'Sent', 'Confirmed', 'Partial', 'Complete', 'Cancelled')),
    subtotal REAL DEFAULT 0.0,
    tax_rate REAL DEFAULT 0.0,
    tax_amount REAL DEFAULT 0.0,
    shipping_cost REAL DEFAULT 0.0,
    total REAL DEFAULT 0.0,
    notes TEXT DEFAULT '',
    internal_notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_warehouse ON purchase_orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(order_date);

-- ============================================================================
-- 12. PURCHASE_ORDER_ITEMS - Line items for purchase orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit_cost REAL DEFAULT 0.0,
    line_total REAL DEFAULT 0.0,
    quantity_received REAL DEFAULT 0.0,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product ON purchase_order_items(product_id);

-- ============================================================================
-- 13. STOCK_MOVEMENTS - Complete audit trail of all stock changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL CHECK(movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RETURN')),
    quantity REAL NOT NULL,
    reference_type TEXT DEFAULT '' CHECK(reference_type IN ('', 'SALES_ORDER', 'PURCHASE_ORDER', 'ADJUSTMENT', 'TRANSFER')),
    reference_id INTEGER,
    cost_per_unit REAL DEFAULT 0.0,
    notes TEXT DEFAULT '',
    created_by TEXT DEFAULT 'system',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);

-- ============================================================================
-- 14. STOCK_ADJUSTMENTS - Manual stock corrections
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adjustment_number TEXT UNIQUE NOT NULL,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    adjustment_quantity REAL NOT NULL,
    reason TEXT DEFAULT '' CHECK(reason IN ('', 'Damaged', 'Lost', 'Found', 'Expired', 'Physical Count', 'Other')),
    notes TEXT DEFAULT '',
    adjusted_by TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_warehouse ON stock_adjustments(warehouse_id);

-- ============================================================================
-- 15. PRICE_LISTS - Customer tier pricing
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_tier TEXT NOT NULL CHECK(customer_tier IN ('Standard', 'Silver', 'Gold', 'Platinum')),
    product_id INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(customer_tier, product_id, min_quantity)
);

CREATE INDEX IF NOT EXISTS idx_price_lists_tier ON price_lists(customer_tier);
CREATE INDEX IF NOT EXISTS idx_price_lists_product ON price_lists(product_id);

-- ============================================================================
-- 16. GOODS_RECEIVED - Receiving against purchase orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS goods_received (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grn_number TEXT UNIQUE NOT NULL,
    purchase_order_id INTEGER NOT NULL,
    received_date TEXT NOT NULL,
    received_by TEXT DEFAULT '',
    quality_check TEXT DEFAULT 'Pass' CHECK(quality_check IN ('Pass', 'Fail', 'Partial')),
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
);

CREATE INDEX IF NOT EXISTS idx_goods_received_po ON goods_received(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_received_date ON goods_received(received_date);

-- ============================================================================
-- 17. GOODS_RECEIVED_ITEMS - Items received in GRN
-- ============================================================================
CREATE TABLE IF NOT EXISTS goods_received_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grn_id INTEGER NOT NULL,
    po_item_id INTEGER NOT NULL,
    quantity_received REAL NOT NULL,
    quality_status TEXT DEFAULT 'Accepted' CHECK(quality_status IN ('Accepted', 'Rejected', 'Pending')),
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grn_id) REFERENCES goods_received(id) ON DELETE CASCADE,
    FOREIGN KEY (po_item_id) REFERENCES purchase_order_items(id)
);

CREATE INDEX IF NOT EXISTS idx_goods_received_items_grn ON goods_received_items(grn_id);
CREATE INDEX IF NOT EXISTS idx_goods_received_items_po_item ON goods_received_items(po_item_id);

-- ============================================================================
-- TRIGGERS - Automatic calculations and updates
-- ============================================================================

-- Auto-update settings timestamp
CREATE TRIGGER IF NOT EXISTS update_settings_timestamp
AFTER UPDATE ON settings
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = 1;
END;

-- Auto-update warehouse timestamp
CREATE TRIGGER IF NOT EXISTS update_warehouse_timestamp
AFTER UPDATE ON warehouses
FOR EACH ROW
BEGIN
    UPDATE warehouses SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Auto-update product timestamp
CREATE TRIGGER IF NOT EXISTS update_product_timestamp
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Auto-update customer timestamp
CREATE TRIGGER IF NOT EXISTS update_customer_timestamp
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Auto-update sales order timestamp
CREATE TRIGGER IF NOT EXISTS update_sales_order_timestamp
AFTER UPDATE ON sales_orders
FOR EACH ROW
BEGIN
    UPDATE sales_orders SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Auto-update purchase order timestamp
CREATE TRIGGER IF NOT EXISTS update_purchase_order_timestamp
AFTER UPDATE ON purchase_orders
FOR EACH ROW
BEGIN
    UPDATE purchase_orders SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ============================================================================
-- VIEWS - Convenient reporting views
-- ============================================================================

-- View: Stock levels with product details
CREATE VIEW IF NOT EXISTS v_stock_summary AS
SELECT
    p.id as product_id,
    p.sku,
    p.name as product_name,
    p.category_id,
    pc.name as category_name,
    w.id as warehouse_id,
    w.name as warehouse_name,
    sl.quantity,
    sl.reserved_quantity,
    sl.available_quantity,
    p.min_stock_level,
    p.reorder_point,
    p.cost_price,
    p.sell_price,
    (sl.quantity * p.cost_price) as stock_value
FROM stock_levels sl
JOIN products p ON sl.product_id = p.id
JOIN warehouses w ON sl.warehouse_id = w.id
LEFT JOIN product_categories pc ON p.category_id = pc.id
WHERE p.active = 1 AND w.active = 1;

-- View: Low stock items
CREATE VIEW IF NOT EXISTS v_low_stock_items AS
SELECT
    p.id,
    p.sku,
    p.name,
    w.name as warehouse_name,
    sl.available_quantity,
    p.min_stock_level,
    p.reorder_point,
    p.reorder_quantity,
    (p.reorder_point - sl.available_quantity) as qty_to_reorder
FROM stock_levels sl
JOIN products p ON sl.product_id = p.id
JOIN warehouses w ON sl.warehouse_id = w.id
WHERE p.active = 1
    AND p.track_inventory = 1
    AND sl.available_quantity <= p.reorder_point;

-- View: Sales order summary
CREATE VIEW IF NOT EXISTS v_sales_order_summary AS
SELECT
    so.id,
    so.order_number,
    so.order_date,
    so.status,
    c.customer_name,
    c.company_name,
    w.name as warehouse_name,
    so.subtotal,
    so.tax_amount,
    so.shipping_cost,
    so.total,
    COUNT(soi.id) as item_count
FROM sales_orders so
JOIN customers c ON so.customer_id = c.id
JOIN warehouses w ON so.warehouse_id = w.id
LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
GROUP BY so.id;

-- View: Purchase order summary
CREATE VIEW IF NOT EXISTS v_purchase_order_summary AS
SELECT
    po.id,
    po.po_number,
    po.order_date,
    po.expected_date,
    po.status,
    s.company_name as supplier_name,
    w.name as warehouse_name,
    po.subtotal,
    po.tax_amount,
    po.total,
    COUNT(poi.id) as item_count
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.id
JOIN warehouses w ON po.warehouse_id = w.id
LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
GROUP BY po.id;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
