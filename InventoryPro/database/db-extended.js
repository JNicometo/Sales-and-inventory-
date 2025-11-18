// ============================================================================
// INVENTORYPRO DATABASE OPERATIONS (EXTENDED)
// CRUD operations for Customers, Suppliers, Orders
// ============================================================================

const { getDatabase } = require('./db');

// ============================================================================
// CUSTOMERS
// ============================================================================

const customers = {
    getAll: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM customers ORDER BY customer_name').all();
    },

    getActive: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM customers WHERE active = 1 ORDER BY customer_name').all();
    },

    getById: (id) => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    },

    search: (query) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM customers
            WHERE customer_name LIKE ? OR company_name LIKE ? OR email LIKE ?
            ORDER BY customer_name
            LIMIT 100
        `).all(`%${query}%`, `%${query}%`, `%${query}%`);
    },

    create: (data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO customers (
                customer_code, customer_name, company_name, email, phone,
                billing_address, billing_city, billing_state, billing_zip,
                shipping_address, shipping_city, shipping_state, shipping_zip,
                payment_terms, credit_limit, customer_tier, notes, active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            data.customer_code || null,
            data.customer_name,
            data.company_name || '',
            data.email || '',
            data.phone || '',
            data.billing_address || '',
            data.billing_city || '',
            data.billing_state || '',
            data.billing_zip || '',
            data.shipping_address || '',
            data.shipping_city || '',
            data.shipping_state || '',
            data.shipping_zip || '',
            data.payment_terms || 'Net 30',
            data.credit_limit || 0,
            data.customer_tier || 'Standard',
            data.notes || '',
            data.active !== undefined ? data.active : 1
        );
    },

    update: (id, data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            UPDATE customers SET
                customer_code = ?,
                customer_name = ?,
                company_name = ?,
                email = ?,
                phone = ?,
                billing_address = ?,
                billing_city = ?,
                billing_state = ?,
                billing_zip = ?,
                shipping_address = ?,
                shipping_city = ?,
                shipping_state = ?,
                shipping_zip = ?,
                payment_terms = ?,
                credit_limit = ?,
                customer_tier = ?,
                notes = ?,
                active = ?
            WHERE id = ?
        `);

        return stmt.run(
            data.customer_code || null,
            data.customer_name,
            data.company_name || '',
            data.email || '',
            data.phone || '',
            data.billing_address || '',
            data.billing_city || '',
            data.billing_state || '',
            data.billing_zip || '',
            data.shipping_address || '',
            data.shipping_city || '',
            data.shipping_state || '',
            data.shipping_zip || '',
            data.payment_terms || 'Net 30',
            data.credit_limit || 0,
            data.customer_tier || 'Standard',
            data.notes || '',
            data.active !== undefined ? data.active : 1,
            id
        );
    },

    delete: (id) => {
        const db = getDatabase();
        return db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    }
};

// ============================================================================
// SUPPLIERS
// ============================================================================

const suppliers = {
    getAll: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM suppliers ORDER BY company_name').all();
    },

    getActive: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM suppliers WHERE active = 1 ORDER BY company_name').all();
    },

    getById: (id) => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    },

    search: (query) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM suppliers
            WHERE company_name LIKE ? OR contact_name LIKE ? OR email LIKE ?
            ORDER BY company_name
            LIMIT 100
        `).all(`%${query}%`, `%${query}%`, `%${query}%`);
    },

    create: (data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO suppliers (
                supplier_code, company_name, contact_name, email, phone,
                address, city, state, zip, payment_terms, lead_time_days,
                rating, notes, active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            data.supplier_code || null,
            data.company_name,
            data.contact_name || '',
            data.email || '',
            data.phone || '',
            data.address || '',
            data.city || '',
            data.state || '',
            data.zip || '',
            data.payment_terms || 'Net 30',
            data.lead_time_days || 7,
            data.rating || 0,
            data.notes || '',
            data.active !== undefined ? data.active : 1
        );
    },

    update: (id, data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            UPDATE suppliers SET
                supplier_code = ?,
                company_name = ?,
                contact_name = ?,
                email = ?,
                phone = ?,
                address = ?,
                city = ?,
                state = ?,
                zip = ?,
                payment_terms = ?,
                lead_time_days = ?,
                rating = ?,
                notes = ?,
                active = ?
            WHERE id = ?
        `);

        return stmt.run(
            data.supplier_code || null,
            data.company_name,
            data.contact_name || '',
            data.email || '',
            data.phone || '',
            data.address || '',
            data.city || '',
            data.state || '',
            data.zip || '',
            data.payment_terms || 'Net 30',
            data.lead_time_days || 7,
            data.rating || 0,
            data.notes || '',
            data.active !== undefined ? data.active : 1,
            id
        );
    },

    delete: (id) => {
        const db = getDatabase();
        return db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
    }
};

// ============================================================================
// SALES ORDERS
// ============================================================================

const salesOrders = {
    getAll: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM v_sales_order_summary ORDER BY order_date DESC').all();
    },

    getById: (id) => {
        const db = getDatabase();
        const order = db.prepare(`
            SELECT so.*, c.customer_name, c.company_name, w.name as warehouse_name
            FROM sales_orders so
            JOIN customers c ON so.customer_id = c.id
            JOIN warehouses w ON so.warehouse_id = w.id
            WHERE so.id = ?
        `).get(id);

        if (order) {
            order.items = db.prepare(`
                SELECT soi.*, p.name as product_name, p.sku
                FROM sales_order_items soi
                JOIN products p ON soi.product_id = p.id
                WHERE soi.sales_order_id = ?
            `).all(id);
        }

        return order;
    },

    getByStatus: (status) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM v_sales_order_summary
            WHERE status = ?
            ORDER BY order_date DESC
        `).all(status);
    },

    create: (orderData, items) => {
        const db = getDatabase();

        const createOrder = db.transaction((order, orderItems) => {
            // Insert order header
            const orderStmt = db.prepare(`
                INSERT INTO sales_orders (
                    order_number, customer_id, warehouse_id, order_date, required_date,
                    status, subtotal, tax_rate, tax_amount, shipping_cost,
                    discount_type, discount_value, discount_amount, total,
                    notes, internal_notes, shipping_method
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = orderStmt.run(
                order.order_number,
                order.customer_id,
                order.warehouse_id,
                order.order_date,
                order.required_date || null,
                order.status || 'Draft',
                order.subtotal || 0,
                order.tax_rate || 0,
                order.tax_amount || 0,
                order.shipping_cost || 0,
                order.discount_type || 'none',
                order.discount_value || 0,
                order.discount_amount || 0,
                order.total || 0,
                order.notes || '',
                order.internal_notes || '',
                order.shipping_method || ''
            );

            const orderId = result.lastInsertRowid;

            // Insert order items
            const itemStmt = db.prepare(`
                INSERT INTO sales_order_items (
                    sales_order_id, product_id, quantity, unit_price,
                    discount_percent, discount_amount, line_total, notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const item of orderItems) {
                itemStmt.run(
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.unit_price || 0,
                    item.discount_percent || 0,
                    item.discount_amount || 0,
                    item.line_total || 0,
                    item.notes || ''
                );

                // Reserve stock if order is confirmed
                if (order.status === 'Confirmed') {
                    db.prepare(`
                        UPDATE stock_levels
                        SET reserved_quantity = reserved_quantity + ?
                        WHERE product_id = ? AND warehouse_id = ?
                    `).run(item.quantity, item.product_id, order.warehouse_id);
                }
            }

            return orderId;
        });

        return createOrder(orderData, items);
    },

    update: (id, orderData, items) => {
        const db = getDatabase();

        const updateOrder = db.transaction((orderId, order, orderItems) => {
            // Update order header
            const orderStmt = db.prepare(`
                UPDATE sales_orders SET
                    customer_id = ?,
                    warehouse_id = ?,
                    order_date = ?,
                    required_date = ?,
                    status = ?,
                    subtotal = ?,
                    tax_rate = ?,
                    tax_amount = ?,
                    shipping_cost = ?,
                    discount_type = ?,
                    discount_value = ?,
                    discount_amount = ?,
                    total = ?,
                    notes = ?,
                    internal_notes = ?,
                    shipping_method = ?,
                    tracking_number = ?
                WHERE id = ?
            `);

            orderStmt.run(
                order.customer_id,
                order.warehouse_id,
                order.order_date,
                order.required_date || null,
                order.status || 'Draft',
                order.subtotal || 0,
                order.tax_rate || 0,
                order.tax_amount || 0,
                order.shipping_cost || 0,
                order.discount_type || 'none',
                order.discount_value || 0,
                order.discount_amount || 0,
                order.total || 0,
                order.notes || '',
                order.internal_notes || '',
                order.shipping_method || '',
                order.tracking_number || '',
                orderId
            );

            // Delete existing items
            db.prepare('DELETE FROM sales_order_items WHERE sales_order_id = ?').run(orderId);

            // Insert updated items
            const itemStmt = db.prepare(`
                INSERT INTO sales_order_items (
                    sales_order_id, product_id, quantity, unit_price,
                    discount_percent, discount_amount, line_total, notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const item of orderItems) {
                itemStmt.run(
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.unit_price || 0,
                    item.discount_percent || 0,
                    item.discount_amount || 0,
                    item.line_total || 0,
                    item.notes || ''
                );
            }
        });

        updateOrder(id, orderData, items);
    },

    delete: (id) => {
        const db = getDatabase();
        return db.prepare('DELETE FROM sales_orders WHERE id = ?').run(id);
    },

    fulfillOrder: (orderId, items) => {
        const db = getDatabase();

        const fulfill = db.transaction((id, fulfillItems) => {
            const order = db.prepare('SELECT warehouse_id FROM sales_orders WHERE id = ?').get(id);

            for (const item of fulfillItems) {
                // Update fulfilled quantity
                db.prepare(`
                    UPDATE sales_order_items
                    SET quantity_fulfilled = quantity_fulfilled + ?
                    WHERE id = ?
                `).run(item.quantity, item.id);

                // Reduce stock
                db.prepare(`
                    UPDATE stock_levels
                    SET quantity = quantity - ?,
                        reserved_quantity = reserved_quantity - ?
                    WHERE product_id = ? AND warehouse_id = ?
                `).run(item.quantity, item.quantity, item.product_id, order.warehouse_id);

                // Record stock movement
                db.prepare(`
                    INSERT INTO stock_movements (
                        product_id, warehouse_id, movement_type, quantity,
                        reference_type, reference_id, notes
                    )
                    VALUES (?, ?, 'OUT', ?, 'SALES_ORDER', ?, ?)
                `).run(item.product_id, order.warehouse_id, -item.quantity, id, item.notes || '');
            }

            // Update order status
            db.prepare(`
                UPDATE sales_orders
                SET status = 'Shipped'
                WHERE id = ?
            `).run(id);
        });

        fulfill(orderId, items);
    }
};

// ============================================================================
// PURCHASE ORDERS
// ============================================================================

const purchaseOrders = {
    getAll: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM v_purchase_order_summary ORDER BY order_date DESC').all();
    },

    getById: (id) => {
        const db = getDatabase();
        const order = db.prepare(`
            SELECT po.*, s.company_name as supplier_name, w.name as warehouse_name
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            JOIN warehouses w ON po.warehouse_id = w.id
            WHERE po.id = ?
        `).get(id);

        if (order) {
            order.items = db.prepare(`
                SELECT poi.*, p.name as product_name, p.sku
                FROM purchase_order_items poi
                JOIN products p ON poi.product_id = p.id
                WHERE poi.purchase_order_id = ?
            `).all(id);
        }

        return order;
    },

    create: (orderData, items) => {
        const db = getDatabase();

        const createPO = db.transaction((order, orderItems) => {
            // Insert PO header
            const orderStmt = db.prepare(`
                INSERT INTO purchase_orders (
                    po_number, supplier_id, warehouse_id, order_date, expected_date,
                    status, subtotal, tax_rate, tax_amount, shipping_cost, total,
                    notes, internal_notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = orderStmt.run(
                order.po_number,
                order.supplier_id,
                order.warehouse_id,
                order.order_date,
                order.expected_date || null,
                order.status || 'Draft',
                order.subtotal || 0,
                order.tax_rate || 0,
                order.tax_amount || 0,
                order.shipping_cost || 0,
                order.total || 0,
                order.notes || '',
                order.internal_notes || ''
            );

            const orderId = result.lastInsertRowid;

            // Insert PO items
            const itemStmt = db.prepare(`
                INSERT INTO purchase_order_items (
                    purchase_order_id, product_id, quantity, unit_cost, line_total, notes
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            for (const item of orderItems) {
                itemStmt.run(
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.unit_cost || 0,
                    item.line_total || 0,
                    item.notes || ''
                );
            }

            return orderId;
        });

        return createPO(orderData, items);
    },

    update: (id, orderData, items) => {
        const db = getDatabase();

        const updatePO = db.transaction((orderId, order, orderItems) => {
            // Update PO header
            db.prepare(`
                UPDATE purchase_orders SET
                    supplier_id = ?,
                    warehouse_id = ?,
                    order_date = ?,
                    expected_date = ?,
                    status = ?,
                    subtotal = ?,
                    tax_rate = ?,
                    tax_amount = ?,
                    shipping_cost = ?,
                    total = ?,
                    notes = ?,
                    internal_notes = ?
                WHERE id = ?
            `).run(
                order.supplier_id,
                order.warehouse_id,
                order.order_date,
                order.expected_date || null,
                order.status || 'Draft',
                order.subtotal || 0,
                order.tax_rate || 0,
                order.tax_amount || 0,
                order.shipping_cost || 0,
                order.total || 0,
                order.notes || '',
                order.internal_notes || '',
                orderId
            );

            // Delete existing items
            db.prepare('DELETE FROM purchase_order_items WHERE purchase_order_id = ?').run(orderId);

            // Insert updated items
            const itemStmt = db.prepare(`
                INSERT INTO purchase_order_items (
                    purchase_order_id, product_id, quantity, unit_cost, line_total, notes
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            for (const item of orderItems) {
                itemStmt.run(
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.unit_cost || 0,
                    item.line_total || 0,
                    item.notes || ''
                );
            }
        });

        updatePO(id, orderData, items);
    },

    delete: (id) => {
        const db = getDatabase();
        return db.prepare('DELETE FROM purchase_orders WHERE id = ?').run(id);
    },

    receiveGoods: (poId, receivedItems, receivedBy) => {
        const db = getDatabase();

        const receive = db.transaction((orderId, items, user) => {
            const po = db.prepare('SELECT warehouse_id FROM purchase_orders WHERE id = ?').get(orderId);

            // Create GRN
            const grnNumber = `GRN-${Date.now()}`;
            const grnResult = db.prepare(`
                INSERT INTO goods_received (
                    grn_number, purchase_order_id, received_date, received_by, quality_check
                )
                VALUES (?, ?, ?, ?, 'Pass')
            `).run(grnNumber, orderId, new Date().toISOString().split('T')[0], user);

            const grnId = grnResult.lastInsertRowid;

            // Record received items and update stock
            for (const item of items) {
                // Record GRN item
                db.prepare(`
                    INSERT INTO goods_received_items (
                        grn_id, po_item_id, quantity_received, quality_status
                    )
                    VALUES (?, ?, ?, 'Accepted')
                `).run(grnId, item.po_item_id, item.quantity);

                // Update PO item received quantity
                db.prepare(`
                    UPDATE purchase_order_items
                    SET quantity_received = quantity_received + ?
                    WHERE id = ?
                `).run(item.quantity, item.po_item_id);

                // Increase stock
                const poItem = db.prepare('SELECT product_id FROM purchase_order_items WHERE id = ?').get(item.po_item_id);

                db.prepare(`
                    UPDATE stock_levels
                    SET quantity = quantity + ?
                    WHERE product_id = ? AND warehouse_id = ?
                `).run(item.quantity, poItem.product_id, po.warehouse_id);

                // Record stock movement
                db.prepare(`
                    INSERT INTO stock_movements (
                        product_id, warehouse_id, movement_type, quantity,
                        reference_type, reference_id, cost_per_unit
                    )
                    VALUES (?, ?, 'IN', ?, 'PURCHASE_ORDER', ?, ?)
                `).run(poItem.product_id, po.warehouse_id, item.quantity, orderId, item.unit_cost || 0);
            }

            // Update PO status
            db.prepare(`
                UPDATE purchase_orders
                SET status = 'Complete'
                WHERE id = ?
            `).run(orderId);

            return grnId;
        });

        return receive(poId, receivedItems, receivedBy);
    }
};

// ============================================================================
// STOCK MOVEMENTS & REPORTS
// ============================================================================

const movements = {
    getAll: (limit = 1000) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT sm.*, p.name as product_name, p.sku, w.name as warehouse_name
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            JOIN warehouses w ON sm.warehouse_id = w.id
            ORDER BY sm.created_at DESC
            LIMIT ?
        `).all(limit);
    },

    getByProduct: (productId, limit = 100) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT sm.*, w.name as warehouse_name
            FROM stock_movements sm
            JOIN warehouses w ON sm.warehouse_id = w.id
            WHERE sm.product_id = ?
            ORDER BY sm.created_at DESC
            LIMIT ?
        `).all(productId, limit);
    },

    getByWarehouse: (warehouseId, limit = 100) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT sm.*, p.name as product_name, p.sku
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            WHERE sm.warehouse_id = ?
            ORDER BY sm.created_at DESC
            LIMIT ?
        `).all(warehouseId, limit);
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    customers,
    suppliers,
    salesOrders,
    purchaseOrders,
    movements
};
