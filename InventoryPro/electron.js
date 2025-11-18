// ============================================================================
// INVENTORYPRO - ELECTRON MAIN PROCESS
// Desktop application with IPC communication to React frontend
// ============================================================================

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Import database operations
const db = require('./database/db');
const dbExtended = require('./database/db-extended');

let mainWindow;

// ============================================================================
// WINDOW CREATION
// ============================================================================

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'public', 'icon.png')
    });

    // Load app
    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, 'build/index.html')}`
    );

    // Open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Create menu
    createMenu();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ============================================================================
// APPLICATION MENU
// ============================================================================

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Settings',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow.webContents.send('navigate', '/settings');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About InventoryPro',
                    click: () => {
                        mainWindow.webContents.send('show-about');
                    }
                },
                {
                    label: 'Documentation',
                    click: () => {
                        // Open documentation
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// ============================================================================
// APP LIFECYCLE
// ============================================================================

app.whenReady().then(() => {
    // Initialize database
    db.getDatabase();

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        db.closeDatabase();
        app.quit();
    }
});

app.on('before-quit', () => {
    db.closeDatabase();
});

// ============================================================================
// IPC HANDLERS - SETTINGS
// ============================================================================

ipcMain.handle('settings:get', async () => {
    try {
        return { success: true, data: db.settings.get() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('settings:update', async (event, data) => {
    try {
        db.settings.update(data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// IPC HANDLERS - WAREHOUSES
// ============================================================================

ipcMain.handle('warehouses:getAll', async () => {
    try {
        return { success: true, data: db.warehouses.getAll() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('warehouses:getActive', async () => {
    try {
        return { success: true, data: db.warehouses.getActive() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('warehouses:getById', async (event, id) => {
    try {
        return { success: true, data: db.warehouses.getById(id) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('warehouses:create', async (event, data) => {
    try {
        const result = db.warehouses.create(data);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('warehouses:update', async (event, id, data) => {
    try {
        db.warehouses.update(id, data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('warehouses:delete', async (event, id) => {
    try {
        db.warehouses.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// IPC HANDLERS - CATEGORIES
// ============================================================================

ipcMain.handle('categories:getAll', async () => {
    try {
        return { success: true, data: db.categories.getAll() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('categories:create', async (event, data) => {
    try {
        const result = db.categories.create(data);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('categories:update', async (event, id, data) => {
    try {
        db.categories.update(id, data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('categories:delete', async (event, id) => {
    try {
        db.categories.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// IPC HANDLERS - PRODUCTS
// ============================================================================

ipcMain.handle('products:getAll', async () => {
    try {
        return { success: true, data: db.products.getAll() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('products:getActive', async () => {
    try {
        return { success: true, data: db.products.getActive() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('products:getById', async (event, id) => {
    try {
        return { success: true, data: db.products.getById(id) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('products:search', async (event, query) => {
    try {
        return { success: true, data: db.products.search(query) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('products:create', async (event, data) => {
    try {
        const result = db.products.create(data);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('products:update', async (event, id, data) => {
    try {
        db.products.update(id, data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('products:delete', async (event, id) => {
    try {
        db.products.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// IPC HANDLERS - STOCK
// ============================================================================

ipcMain.handle('stock:getAll', async () => {
    try {
        return { success: true, data: db.stock.getAll() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stock:getByProduct', async (event, productId) => {
    try {
        return { success: true, data: db.stock.getByProduct(productId) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stock:getLowStock', async () => {
    try {
        return { success: true, data: db.stock.getLowStock() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stock:adjust', async (event, productId, warehouseId, adjustment, movementType, referenceType, referenceId, notes) => {
    try {
        db.stock.adjustStock(productId, warehouseId, adjustment, movementType, referenceType, referenceId, notes);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// IPC HANDLERS - CUSTOMERS
// ============================================================================

ipcMain.handle('customers:getAll', async () => {
    try {
        return { success: true, data: dbExtended.customers.getAll() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('customers:getActive', async () => {
    try {
        return { success: true, data: dbExtended.customers.getActive() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('customers:search', async (event, query) => {
    try {
        return { success: true, data: dbExtended.customers.search(query) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('customers:create', async (event, data) => {
    try {
        const result = dbExtended.customers.create(data);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('customers:update', async (event, id, data) => {
    try {
        dbExtended.customers.update(id, data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('customers:delete', async (event, id) => {
    try {
        dbExtended.customers.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// IPC HANDLERS - SUPPLIERS
// ============================================================================

ipcMain.handle('suppliers:getAll', async () => {
    try {
        return { success: true, data: dbExtended.suppliers.getAll() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('suppliers:create', async (event, data) => {
    try {
        const result = dbExtended.suppliers.create(data);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('suppliers:update', async (event, id, data) => {
    try {
        dbExtended.suppliers.update(id, data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// IPC HANDLERS - SALES ORDERS
// ============================================================================

ipcMain.handle('salesOrders:getAll', async () => {
    try {
        return { success: true, data: dbExtended.salesOrders.getAll() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('salesOrders:getById', async (event, id) => {
    try {
        return { success: true, data: dbExtended.salesOrders.getById(id) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('salesOrders:create', async (event, orderData, items) => {
    try {
        const result = dbExtended.salesOrders.create(orderData, items);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('salesOrders:update', async (event, id, orderData, items) => {
    try {
        dbExtended.salesOrders.update(id, orderData, items);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('salesOrders:fulfill', async (event, orderId, items) => {
    try {
        dbExtended.salesOrders.fulfillOrder(orderId, items);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// IPC HANDLERS - PURCHASE ORDERS
// ============================================================================

ipcMain.handle('purchaseOrders:getAll', async () => {
    try {
        return { success: true, data: dbExtended.purchaseOrders.getAll() };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('purchaseOrders:getById', async (event, id) => {
    try {
        return { success: true, data: dbExtended.purchaseOrders.getById(id) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('purchaseOrders:create', async (event, orderData, items) => {
    try {
        const result = dbExtended.purchaseOrders.create(orderData, items);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('purchaseOrders:update', async (event, id, orderData, items) => {
    try {
        dbExtended.purchaseOrders.update(id, orderData, items);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('purchaseOrders:receive', async (event, poId, items, receivedBy) => {
    try {
        const result = dbExtended.purchaseOrders.receiveGoods(poId, items, receivedBy);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// IPC HANDLERS - STOCK MOVEMENTS
// ============================================================================

ipcMain.handle('movements:getAll', async (event, limit) => {
    try {
        return { success: true, data: dbExtended.movements.getAll(limit) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('movements:getByProduct', async (event, productId, limit) => {
    try {
        return { success: true, data: dbExtended.movements.getByProduct(productId, limit) };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

ipcMain.handle('app:getVersion', async () => {
    return app.getVersion();
});

ipcMain.handle('app:getPlatform', async () => {
    return process.platform;
});

console.log('InventoryPro Electron main process initialized');
