// ============================================================================
// INVENTORYPRO DATABASE OPERATIONS
// SQLite database management with better-sqlite3
// ============================================================================

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db = null;

// ============================================================================
// Database initialization
// ============================================================================

function getDatabase() {
    if (db) return db;

    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'inventorypro.db');

    console.log('Database path:', dbPath);

    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');

    initializeSchema();

    return db;
}

function initializeSchema() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    db.exec(schema);
    console.log('Database schema initialized');
}

function closeDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}

// ============================================================================
// SETTINGS
// ============================================================================

const settings = {
    get: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM settings WHERE id = 1').get();
    },

    update: (data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            UPDATE settings SET
                company_name = ?,
                company_email = ?,
                company_phone = ?,
                company_address = ?,
                company_city = ?,
                company_state = ?,
                company_zip = ?,
                logo_url = ?,
                currency_symbol = ?,
                tax_rate = ?,
                default_payment_terms = ?,
                low_stock_threshold = ?,
                enable_barcode_scanning = ?,
                enable_multi_warehouse = ?,
                stock_valuation_method = ?
            WHERE id = 1
        `);

        return stmt.run(
            data.company_name,
            data.company_email,
            data.company_phone,
            data.company_address,
            data.company_city,
            data.company_state,
            data.company_zip,
            data.logo_url,
            data.currency_symbol,
            data.tax_rate,
            data.default_payment_terms,
            data.low_stock_threshold,
            data.enable_barcode_scanning,
            data.enable_multi_warehouse,
            data.stock_valuation_method
        );
    }
};

// ============================================================================
// WAREHOUSES
// ============================================================================

const warehouses = {
    getAll: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM warehouses ORDER BY name').all();
    },

    getActive: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM warehouses WHERE active = 1 ORDER BY name').all();
    },

    getById: (id) => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM warehouses WHERE id = ?').get(id);
    },

    create: (data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO warehouses (name, code, address, city, state, zip, phone, manager_name, is_default, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            data.name,
            data.code || null,
            data.address || '',
            data.city || '',
            data.state || '',
            data.zip || '',
            data.phone || '',
            data.manager_name || '',
            data.is_default || 0,
            data.active !== undefined ? data.active : 1
        );
    },

    update: (id, data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            UPDATE warehouses SET
                name = ?,
                code = ?,
                address = ?,
                city = ?,
                state = ?,
                zip = ?,
                phone = ?,
                manager_name = ?,
                is_default = ?,
                active = ?
            WHERE id = ?
        `);

        return stmt.run(
            data.name,
            data.code || null,
            data.address || '',
            data.city || '',
            data.state || '',
            data.zip || '',
            data.phone || '',
            data.manager_name || '',
            data.is_default || 0,
            data.active !== undefined ? data.active : 1,
            id
        );
    },

    delete: (id) => {
        const db = getDatabase();
        return db.prepare('DELETE FROM warehouses WHERE id = ?').run(id);
    }
};

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

const categories = {
    getAll: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM product_categories ORDER BY name').all();
    },

    getById: (id) => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM product_categories WHERE id = ?').get(id);
    },

    create: (data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO product_categories (name, parent_id, description)
            VALUES (?, ?, ?)
        `);

        return stmt.run(data.name, data.parent_id || null, data.description || '');
    },

    update: (id, data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            UPDATE product_categories SET
                name = ?,
                parent_id = ?,
                description = ?
            WHERE id = ?
        `);

        return stmt.run(data.name, data.parent_id || null, data.description || '', id);
    },

    delete: (id) => {
        const db = getDatabase();
        return db.prepare('DELETE FROM product_categories WHERE id = ?').run(id);
    }
};

// ============================================================================
// PRODUCTS
// ============================================================================

const products = {
    getAll: () => {
        const db = getDatabase();
        return db.prepare(`
            SELECT p.*, pc.name as category_name
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            ORDER BY p.name
        `).all();
    },

    getActive: () => {
        const db = getDatabase();
        return db.prepare(`
            SELECT p.*, pc.name as category_name
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.active = 1
            ORDER BY p.name
        `).all();
    },

    getById: (id) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT p.*, pc.name as category_name
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.id = ?
        `).get(id);
    },

    getBySku: (sku) => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM products WHERE sku = ?').get(sku);
    },

    getByBarcode: (barcode) => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM products WHERE barcode = ?').get(barcode);
    },

    search: (query) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT p.*, pc.name as category_name
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?
            ORDER BY p.name
            LIMIT 100
        `).all(`%${query}%`, `%${query}%`, `%${query}%`);
    },

    create: (data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT INTO products (
                sku, name, description, category_id, barcode,
                cost_price, sell_price, min_stock_level, reorder_point, reorder_quantity,
                unit_of_measure, weight, dimensions, image_url, notes, active, track_inventory
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            data.sku,
            data.name,
            data.description || '',
            data.category_id || null,
            data.barcode || '',
            data.cost_price || 0,
            data.sell_price || 0,
            data.min_stock_level || 0,
            data.reorder_point || 0,
            data.reorder_quantity || 0,
            data.unit_of_measure || 'pcs',
            data.weight || 0,
            data.dimensions || '',
            data.image_url || '',
            data.notes || '',
            data.active !== undefined ? data.active : 1,
            data.track_inventory !== undefined ? data.track_inventory : 1
        );
    },

    update: (id, data) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            UPDATE products SET
                sku = ?,
                name = ?,
                description = ?,
                category_id = ?,
                barcode = ?,
                cost_price = ?,
                sell_price = ?,
                min_stock_level = ?,
                reorder_point = ?,
                reorder_quantity = ?,
                unit_of_measure = ?,
                weight = ?,
                dimensions = ?,
                image_url = ?,
                notes = ?,
                active = ?,
                track_inventory = ?
            WHERE id = ?
        `);

        return stmt.run(
            data.sku,
            data.name,
            data.description || '',
            data.category_id || null,
            data.barcode || '',
            data.cost_price || 0,
            data.sell_price || 0,
            data.min_stock_level || 0,
            data.reorder_point || 0,
            data.reorder_quantity || 0,
            data.unit_of_measure || 'pcs',
            data.weight || 0,
            data.dimensions || '',
            data.image_url || '',
            data.notes || '',
            data.active !== undefined ? data.active : 1,
            data.track_inventory !== undefined ? data.track_inventory : 1,
            id
        );
    },

    delete: (id) => {
        const db = getDatabase();
        return db.prepare('DELETE FROM products WHERE id = ?').run(id);
    }
};

// ============================================================================
// STOCK LEVELS
// ============================================================================

const stock = {
    getAll: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM v_stock_summary').all();
    },

    getByProduct: (productId) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT sl.*, w.name as warehouse_name
            FROM stock_levels sl
            JOIN warehouses w ON sl.warehouse_id = w.id
            WHERE sl.product_id = ?
        `).all(productId);
    },

    getByWarehouse: (warehouseId) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM v_stock_summary
            WHERE warehouse_id = ?
        `).all(warehouseId);
    },

    getLowStock: () => {
        const db = getDatabase();
        return db.prepare('SELECT * FROM v_low_stock_items').all();
    },

    getLevel: (productId, warehouseId) => {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM stock_levels
            WHERE product_id = ? AND warehouse_id = ?
        `).get(productId, warehouseId);
    },

    updateLevel: (productId, warehouseId, quantity) => {
        const db = getDatabase();

        // Check if stock level exists
        const existing = db.prepare(`
            SELECT id FROM stock_levels
            WHERE product_id = ? AND warehouse_id = ?
        `).get(productId, warehouseId);

        if (existing) {
            return db.prepare(`
                UPDATE stock_levels
                SET quantity = ?
                WHERE product_id = ? AND warehouse_id = ?
            `).run(quantity, productId, warehouseId);
        } else {
            return db.prepare(`
                INSERT INTO stock_levels (product_id, warehouse_id, quantity)
                VALUES (?, ?, ?)
            `).run(productId, warehouseId, quantity);
        }
    },

    adjustStock: (productId, warehouseId, adjustment, movementType, referenceType, referenceId, notes) => {
        const db = getDatabase();

        // Use transaction
        const adjust = db.transaction(() => {
            // Update stock level
            const current = db.prepare(`
                SELECT quantity FROM stock_levels
                WHERE product_id = ? AND warehouse_id = ?
            `).get(productId, warehouseId);

            const newQuantity = (current?.quantity || 0) + adjustment;

            if (current) {
                db.prepare(`
                    UPDATE stock_levels
                    SET quantity = ?
                    WHERE product_id = ? AND warehouse_id = ?
                `).run(newQuantity, productId, warehouseId);
            } else {
                db.prepare(`
                    INSERT INTO stock_levels (product_id, warehouse_id, quantity)
                    VALUES (?, ?, ?)
                `).run(productId, warehouseId, newQuantity);
            }

            // Record movement
            const product = db.prepare('SELECT cost_price FROM products WHERE id = ?').get(productId);

            db.prepare(`
                INSERT INTO stock_movements (
                    product_id, warehouse_id, movement_type, quantity,
                    reference_type, reference_id, cost_per_unit, notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                productId,
                warehouseId,
                movementType,
                adjustment,
                referenceType || '',
                referenceId || null,
                product?.cost_price || 0,
                notes || ''
            );
        });

        adjust();
    },

    reserveStock: (productId, warehouseId, quantity) => {
        const db = getDatabase();
        return db.prepare(`
            UPDATE stock_levels
            SET reserved_quantity = reserved_quantity + ?
            WHERE product_id = ? AND warehouse_id = ?
        `).run(quantity, productId, warehouseId);
    },

    releaseReservation: (productId, warehouseId, quantity) => {
        const db = getDatabase();
        return db.prepare(`
            UPDATE stock_levels
            SET reserved_quantity = reserved_quantity - ?
            WHERE product_id = ? AND warehouse_id = ?
        `).run(quantity, productId, warehouseId);
    }
};

// ============================================================================
// Continue in next part...
// ============================================================================

module.exports = {
    getDatabase,
    closeDatabase,
    settings,
    warehouses,
    categories,
    products,
    stock
};
