import React, { useState } from 'react';
import {
  Package,
  ShoppingCart,
  FileText,
  Users,
  Warehouse,
  TrendingUp,
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';

// Import components
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import StockLevels from './components/Inventory/StockLevels';
import SalesOrderList from './components/SalesOrders/SalesOrderList';
import PurchaseOrderList from './components/PurchaseOrders/PurchaseOrderList';
import CustomerList from './components/Customers/CustomerList';
import SupplierList from './components/Suppliers/SupplierList';
import Settings from './components/Settings/Settings';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, component: Dashboard },
    { id: 'products', label: 'Products', icon: Package, component: ProductList },
    { id: 'stock', label: 'Stock Levels', icon: Warehouse, component: StockLevels },
    { id: 'sales-orders', label: 'Sales Orders', icon: ShoppingCart, component: SalesOrderList },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: FileText, component: PurchaseOrderList },
    { id: 'customers', label: 'Customers', icon: Users, component: CustomerList },
    { id: 'suppliers', label: 'Suppliers', icon: Users, component: SupplierList },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, component: Settings },
  ];

  const currentMenuItem = menuItems.find(item => item.id === currentView);
  const CurrentComponent = currentMenuItem?.component || Dashboard;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-blue-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8" />
              <h1 className="text-xl font-bold">InventoryPro</h1>
            </div>
          </div>
          <p className="text-xs text-blue-200 mt-1">Inventory Management System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-800 border-l-4 border-white'
                    : 'hover:bg-blue-800 border-l-4 border-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-800">
          <p className="text-xs text-blue-200">Version 1.0.0</p>
          <p className="text-xs text-blue-300 mt-1">© 2025 Your Company</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-2xl font-semibold text-gray-800">
              {currentMenuItem?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Main Warehouse</p>
              <p className="text-xs text-gray-400">Default Location</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <CurrentComponent />
        </div>
      </div>
    </div>
  );
}

export default App;
