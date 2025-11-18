// ============================================================================
// INVENTORYPRO - PRELOAD SCRIPT
// Secure bridge between Electron and React
// ============================================================================

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // ========================================================================
    // SETTINGS
    // ========================================================================
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        update: (data) => ipcRenderer.invoke('settings:update', data)
    },

    // ========================================================================
    // WAREHOUSES
    // ========================================================================
    warehouses: {
        getAll: () => ipcRenderer.invoke('warehouses:getAll'),
        getActive: () => ipcRenderer.invoke('warehouses:getActive'),
        getById: (id) => ipcRenderer.invoke('warehouses:getById', id),
        create: (data) => ipcRenderer.invoke('warehouses:create', data),
        update: (id, data) => ipcRenderer.invoke('warehouses:update', id, data),
        delete: (id) => ipcRenderer.invoke('warehouses:delete', id)
    },

    // ========================================================================
    // CATEGORIES
    // ========================================================================
    categories: {
        getAll: () => ipcRenderer.invoke('categories:getAll'),
        create: (data) => ipcRenderer.invoke('categories:create', data),
        update: (id, data) => ipcRenderer.invoke('categories:update', id, data),
        delete: (id) => ipcRenderer.invoke('categories:delete', id)
    },

    // ========================================================================
    // PRODUCTS
    // ========================================================================
    products: {
        getAll: () => ipcRenderer.invoke('products:getAll'),
        getActive: () => ipcRenderer.invoke('products:getActive'),
        getById: (id) => ipcRenderer.invoke('products:getById', id),
        search: (query) => ipcRenderer.invoke('products:search', query),
        create: (data) => ipcRenderer.invoke('products:create', data),
        update: (id, data) => ipcRenderer.invoke('products:update', id, data),
        delete: (id) => ipcRenderer.invoke('products:delete', id)
    },

    // ========================================================================
    // STOCK
    // ========================================================================
    stock: {
        getAll: () => ipcRenderer.invoke('stock:getAll'),
        getByProduct: (productId) => ipcRenderer.invoke('stock:getByProduct', productId),
        getLowStock: () => ipcRenderer.invoke('stock:getLowStock'),
        adjust: (productId, warehouseId, adjustment, movementType, referenceType, referenceId, notes) =>
            ipcRenderer.invoke('stock:adjust', productId, warehouseId, adjustment, movementType, referenceType, referenceId, notes)
    },

    // ========================================================================
    // CUSTOMERS
    // ========================================================================
    customers: {
        getAll: () => ipcRenderer.invoke('customers:getAll'),
        getActive: () => ipcRenderer.invoke('customers:getActive'),
        search: (query) => ipcRenderer.invoke('customers:search', query),
        create: (data) => ipcRenderer.invoke('customers:create', data),
        update: (id, data) => ipcRenderer.invoke('customers:update', id, data),
        delete: (id) => ipcRenderer.invoke('customers:delete', id)
    },

    // ========================================================================
    // SUPPLIERS
    // ========================================================================
    suppliers: {
        getAll: () => ipcRenderer.invoke('suppliers:getAll'),
        create: (data) => ipcRenderer.invoke('suppliers:create', data),
        update: (id, data) => ipcRenderer.invoke('suppliers:update', id, data)
    },

    // ========================================================================
    // SALES ORDERS
    // ========================================================================
    salesOrders: {
        getAll: () => ipcRenderer.invoke('salesOrders:getAll'),
        getById: (id) => ipcRenderer.invoke('salesOrders:getById', id),
        create: (orderData, items) => ipcRenderer.invoke('salesOrders:create', orderData, items),
        update: (id, orderData, items) => ipcRenderer.invoke('salesOrders:update', id, orderData, items),
        fulfill: (orderId, items) => ipcRenderer.invoke('salesOrders:fulfill', orderId, items)
    },

    // ========================================================================
    // PURCHASE ORDERS
    // ========================================================================
    purchaseOrders: {
        getAll: () => ipcRenderer.invoke('purchaseOrders:getAll'),
        getById: (id) => ipcRenderer.invoke('purchaseOrders:getById', id),
        create: (orderData, items) => ipcRenderer.invoke('purchaseOrders:create', orderData, items),
        update: (id, orderData, items) => ipcRenderer.invoke('purchaseOrders:update', id, orderData, items),
        receive: (poId, items, receivedBy) => ipcRenderer.invoke('purchaseOrders:receive', poId, items, receivedBy)
    },

    // ========================================================================
    // STOCK MOVEMENTS
    // ========================================================================
    movements: {
        getAll: (limit) => ipcRenderer.invoke('movements:getAll', limit),
        getByProduct: (productId, limit) => ipcRenderer.invoke('movements:getByProduct', productId, limit)
    },

    // ========================================================================
    // APP
    // ========================================================================
    app: {
        getVersion: () => ipcRenderer.invoke('app:getVersion'),
        getPlatform: () => ipcRenderer.invoke('app:getPlatform')
    },

    // Event listeners
    onNavigate: (callback) => ipcRenderer.on('navigate', (event, path) => callback(path)),
    onShowAbout: (callback) => ipcRenderer.on('show-about', () => callback())
});

console.log('InventoryPro preload script loaded');
