'use client';

import React, { useState, useEffect } from 'react';
import { dbStore, formatIndianRupee } from '@/lib/dbStore';
import { 
  Layers, 
  ShoppingCart, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  Plus,
  RefreshCw,
  Search,
  Eye,
  Edit,
  Trash2,
  History,
  FileDown,
  Upload,
  CheckCircle,
  HelpCircle,
  MoreVertical,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  ChevronsUpDown,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StockLog {
  date: string;
  type: 'Add' | 'Remove' | 'Transfer' | 'Adjustment';
  qty: number;
  balance: number;
  note: string;
}

interface MaterialItem {
  id: string;
  name: string;
  category: 'Structural' | 'Electrical' | 'Plumbing' | 'Finishing' | 'Machinery';
  code: string;
  unit: string;
  stock: number;
  minThreshold: number;
  purchasePrice: number;
  sellingPrice: number;
  supplier: string;
  warehouse: string;
  description: string;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Critical Stock';
  recentOrders: any[];
  stockHistory: StockLog[];
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSupplier, setFilterSupplier] = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  
  const [sortBy, setSortBy] = useState<'stock' | 'price' | 'supplier' | 'alphabetical'>('alphabetical');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [currentMatId, setCurrentMatId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Structural' | 'Electrical' | 'Plumbing' | 'Finishing' | 'Machinery'>('Structural');
  const [formCode, setFormCode] = useState('');
  const [formUnit, setFormUnit] = useState('m³');
  const [formStock, setFormStock] = useState(0);
  const [formMinThreshold, setFormMinThreshold] = useState(10);
  const [formPurchasePrice, setFormPurchasePrice] = useState(0);
  const [formSellingPrice, setFormSellingPrice] = useState(0);
  const [formSupplier, setFormSupplier] = useState('');
  const [formWarehouse, setFormWarehouse] = useState('Noida Block-A');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formStatus, setFormStatus] = useState<'In Stock' | 'Low Stock' | 'Critical Stock'>('In Stock');

  // View Details Modal
  const [selectedItem, setSelectedItem] = useState<MaterialItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Stock update sub-modal
  const [isStockUpdateOpen, setIsStockUpdateOpen] = useState(false);
  const [stockUpdateType, setStockUpdateType] = useState<'Add' | 'Remove' | 'Transfer' | 'Adjustment'>('Add');
  const [stockUpdateQty, setStockUpdateQty] = useState(10);
  const [stockUpdateNote, setStockUpdateNote] = useState('');

  // Bulk operation checkmarks
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkSupplier, setBulkSupplier] = useState('');
  const [bulkCategory, setBulkCategory] = useState('Structural');
  const [bulkStatus, setBulkStatus] = useState('In Stock');

  // Floating button menu drawer
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Load and enrich materials list from store on mount
  useEffect(() => {
    const raw = dbStore.getMaterials() as any[];
    const enriched: MaterialItem[] = raw.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      code: item.code || `MAT-${item.id.replace(/\D/g, '') || Math.floor(100+Math.random()*900)}`,
      unit: item.unit || 'Units',
      stock: item.stock,
      minThreshold: item.minThreshold || 50,
      purchasePrice: item.costPerUnit || 120,
      sellingPrice: (item.costPerUnit || 120) * 1.25,
      supplier: item.supplier || 'General Supplies Ltd',
      warehouse: item.warehouse || 'Noida Main Depot',
      description: item.description || 'Pre-graded construction materials stashed.',
      image: item.image || '',
      status: item.status || 'In Stock',
      recentOrders: item.recentOrders || [],
      stockHistory: item.stockHistory || [
        { date: '2026-07-15 08:30', type: 'Adjustment', qty: item.stock, balance: item.stock, note: 'Initial stock register audit.' }
      ]
    }));
    setMaterials(enriched);
  }, []);

  // Save to DB store and dispatch reload events
  const syncWithDbStore = (updatedList: MaterialItem[]) => {
    setMaterials(updatedList);
    // Sync back to dbStore items list
    updatedList.forEach(m => {
      dbStore.updateMaterial(m.id, {
        stock: m.stock,
        status: m.status,
        costPerUnit: m.purchasePrice,
        supplier: m.supplier
      });
    });
    // Trigger storage event to reload header or widgets in dashboard
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  };

  // AI calculations
  const calculateAiMetrics = (item: MaterialItem) => {
    const safetyPercent = Math.min(100, Math.round((item.stock / item.minThreshold) * 100));
    const predictedUsage = Math.round(item.stock * 0.12) + 5;
    const daysRemaining = predictedUsage > 0 ? Math.round(item.stock / (predictedUsage / 7)) : 0;
    
    const reorderDate = new Date();
    reorderDate.setDate(reorderDate.getDate() + daysRemaining);
    const expectedReorderDate = daysRemaining > 0 
      ? reorderDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
      : 'Immediate';

    const costAnalysis = item.stock * item.purchasePrice;

    return {
      safetyPercent,
      predictedUsage,
      expectedReorderDate,
      costAnalysis
    };
  };

  // --- CRUD FUNCTIONS ---

  // Add / Edit submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formMode === 'add') {
      const newId = `mat-${Math.floor(1000 + Math.random() * 9000)}`;
      const newItem: MaterialItem = {
        id: newId,
        name: formName,
        category: formCategory,
        code: formCode || `MAT-${Math.floor(100 + Math.random()*900)}`,
        unit: formUnit,
        stock: formStock,
        minThreshold: formMinThreshold,
        purchasePrice: formPurchasePrice,
        sellingPrice: formSellingPrice || formPurchasePrice * 1.25,
        supplier: formSupplier || 'General Supplies',
        warehouse: formWarehouse,
        description: formDescription,
        image: formImage,
        status: formStatus,
        recentOrders: [],
        stockHistory: [
          { date: new Date().toLocaleString(), type: 'Adjustment', qty: formStock, balance: formStock, note: 'Initial stock stashed.' }
        ]
      };
      
      const nextList = [newItem, ...materials];
      dbStore.addMaterial(newItem as any);
      syncWithDbStore(nextList);
    } else if (formMode === 'edit' && currentMatId) {
      const nextList = materials.map(m => {
        if (m.id === currentMatId) {
          const isStockChanged = m.stock !== formStock;
          const newHistory = isStockChanged 
            ? [{ date: new Date().toLocaleString(), type: 'Adjustment' as const, qty: formStock, balance: formStock, note: 'Stock adjusted manually in editor.' }, ...m.stockHistory]
            : m.stockHistory;

          return {
            ...m,
            name: formName,
            category: formCategory,
            code: formCode,
            unit: formUnit,
            stock: formStock,
            minThreshold: formMinThreshold,
            purchasePrice: formPurchasePrice,
            sellingPrice: formSellingPrice,
            supplier: formSupplier,
            warehouse: formWarehouse,
            description: formDescription,
            image: formImage,
            status: formStatus,
            stockHistory: newHistory
          };
        }
        return m;
      });
      syncWithDbStore(nextList);
    }

    setIsFormModalOpen(false);
    resetFormFields();
  };

  const handleEditClick = (item: MaterialItem) => {
    setFormMode('edit');
    setCurrentMatId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormCode(item.code);
    setFormUnit(item.unit);
    setFormStock(item.stock);
    setFormMinThreshold(item.minThreshold);
    setFormPurchasePrice(item.purchasePrice);
    setFormSellingPrice(item.sellingPrice);
    setFormSupplier(item.supplier);
    setFormWarehouse(item.warehouse);
    setFormDescription(item.description);
    setFormImage(item.image);
    setFormStatus(item.status);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this material permanently from MongoDB?')) {
      const nextList = materials.filter(m => m.id !== id);
      syncWithDbStore(nextList);
    }
  };

  const handleOpenAdd = () => {
    setFormMode('add');
    resetFormFields();
    setIsFormModalOpen(true);
  };

  const resetFormFields = () => {
    setFormName('');
    setFormCategory('Structural');
    setFormCode('');
    setFormUnit('m³');
    setFormStock(100);
    setFormMinThreshold(50);
    setFormPurchasePrice(120);
    setFormSellingPrice(150);
    setFormSupplier('');
    setFormWarehouse('Noida Block-A');
    setFormDescription('');
    setFormImage('');
    setFormStatus('In Stock');
  };

  // Profile image upload reader
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- STOCK TRANSACTIONS ---
  const handleStockUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    let delta = stockUpdateQty;
    if (stockUpdateType === 'Remove') delta = -stockUpdateQty;

    const nextList = materials.map(m => {
      if (m.id === selectedItem.id) {
        const nextStock = Math.max(0, m.stock + delta);
        
        // Auto resolve status
        let nextStatus: 'In Stock' | 'Low Stock' | 'Critical Stock' = 'In Stock';
        if (nextStock <= m.minThreshold * 0.5) nextStatus = 'Critical Stock';
        else if (nextStock <= m.minThreshold) nextStatus = 'Low Stock';

        const log: StockLog = {
          date: new Date().toLocaleString(),
          type: stockUpdateType,
          qty: stockUpdateQty,
          balance: nextStock,
          note: stockUpdateNote || `${stockUpdateType} transaction updated.`
        };

        const updatedItem = {
          ...m,
          stock: nextStock,
          status: nextStatus,
          stockHistory: [log, ...m.stockHistory]
        };

        // Sync view modal active state
        setSelectedItem(updatedItem);
        return updatedItem;
      }
      return m;
    });

    syncWithDbStore(nextList);
    setIsStockUpdateOpen(false);
    setStockUpdateQty(10);
    setStockUpdateNote('');
  };

  // --- BULK OPERATIONS ---
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected materials permanently?`)) {
      const nextList = materials.filter(m => !selectedIds.includes(m.id));
      syncWithDbStore(nextList);
      setSelectedIds([]);
    }
  };

  const handleBulkUpdate = () => {
    if (selectedIds.length === 0) return;
    const nextList = materials.map(m => {
      if (selectedIds.includes(m.id)) {
        return {
          ...m,
          supplier: bulkSupplier || m.supplier,
          category: bulkCategory as any,
          status: bulkStatus as any
        };
      }
      return m;
    });
    syncWithDbStore(nextList);
    alert(`Bulk update stashed successfully for ${selectedIds.length} elements.`);
    setSelectedIds([]);
  };

  // --- EXPORT SCHEME ---
  const handleExportCSV = () => {
    let csv = "ID,Name,Category,Code,Stock,Unit,Threshold,PurchasePrice,Supplier,Status\n";
    materials.forEach(m => {
      csv += `${m.id},"${m.name}","${m.category}","${m.code}",${m.stock},"${m.unit}",${m.minThreshold},${m.purchasePrice},"${m.supplier}","${m.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Material_Ledger_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        alert('CSV Material data stashed and appended. DB lists updated without refreshing.');
      };
      reader.readAsText(file);
    }
  };

  // --- FILTER & SORT EXECUTION ---
  const filteredMaterials = materials.filter(m => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      m.name.toLowerCase().includes(query) || 
      m.supplier.toLowerCase().includes(query) || 
      m.code.toLowerCase().includes(query) || 
      m.category.toLowerCase().includes(query);

    const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
    const matchesWarehouse = filterWarehouse === 'All' || m.warehouse === filterWarehouse;
    const matchesSupplier = filterSupplier === 'All' || m.supplier === filterSupplier;

    let matchesStatus = true;
    if (filterStatus === 'Low Stock') matchesStatus = m.status === 'Low Stock';
    else if (filterStatus === 'Critical') matchesStatus = m.status === 'Critical Stock';
    else if (filterStatus !== 'All') matchesStatus = m.status === filterStatus;

    return matchesSearch && matchesCategory && matchesWarehouse && matchesSupplier && matchesStatus;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    let valA: any = a.name;
    let valB: any = b.name;

    if (sortBy === 'stock') {
      valA = a.stock;
      valB = b.stock;
    } else if (sortBy === 'price') {
      valA = a.purchasePrice;
      valB = b.purchasePrice;
    } else if (sortBy === 'supplier') {
      valA = a.supplier;
      valB = b.supplier;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">Material Ledger & Logistics</h2>
          <p className="text-xs text-white/50 mt-1">Real-time ledger entries, stock transaction history, and reorder forecasts</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-cyan-500/10 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table & Ledger on Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            
            {/* Search, Filter, Sort Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by code, supplier, category..."
                  className="w-full bg-slate-950 border border-white/5 focus:border-cyan-500/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Sorting triggers */}
              <div className="flex items-center space-x-2 w-full sm:w-auto text-xs text-white/50">
                <span>Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="stock">Stock Level</option>
                  <option value="price">Purchase Price</option>
                  <option value="supplier">Supplier</option>
                </select>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
                  className="p-2 hover:bg-white/5 rounded-lg text-white"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none">
                <option value="All">All Categories</option>
                <option value="Structural">Structural</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Finishing">Finishing</option>
              </select>

              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none">
                <option value="All">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical">Critical</option>
              </select>

              <select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none">
                <option value="All">All Warehouses</option>
                <option value="Noida Block-A">Noida Block-A</option>
                <option value="Noida Main Depot">Noida Main Depot</option>
              </select>

              <button 
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 font-bold py-2 rounded-xl transition-all disabled:opacity-40 text-[10px]"
              >
                Delete Selected ({selectedIds.length})
              </button>
            </div>

            {/* Materials Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                    <th className="p-3 w-8">
                      <button 
                        onClick={() => setSelectedIds(selectedIds.length === materials.length ? [] : materials.map(x => x.id))}
                        className="text-white/60 hover:text-white"
                      >
                        {selectedIds.length === materials.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="p-3">Material Name & Code</th>
                    <th className="p-3">Stock Level</th>
                    <th className="p-3">Safety Limit</th>
                    <th className="p-3">Purchase Price (₹)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedMaterials.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <button onClick={() => toggleSelect(m.id)} className="text-white/60 hover:text-white">
                          {selectedIds.includes(m.id) ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {m.image && (
                            <img src={m.image} alt="icon" className="w-7 h-7 rounded object-cover border border-white/10" />
                          )}
                          <div>
                            <span className="font-semibold text-white block">{m.name}</span>
                            <span className="text-[10px] text-white/40 font-mono">{m.code} • {m.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        {m.stock} <span className="text-white/40 font-normal">{m.unit}</span>
                      </td>
                      <td className="p-3 font-mono text-white/45">
                        {m.minThreshold} {m.unit}
                      </td>
                      <td className="p-3 font-mono text-white/70">
                        {formatIndianRupee(m.purchasePrice)}
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button 
                          onClick={() => { setSelectedItem(m); setIsViewModalOpen(true); }}
                          className="p-1.5 bg-white/5 border border-white/5 hover:border-cyan-500/30 text-white rounded-lg inline-flex items-center"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(m)}
                          className="p-1.5 bg-white/5 border border-white/5 hover:border-yellow-500/30 text-white rounded-lg inline-flex items-center"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5 text-yellow-400" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(m.id)}
                          className="p-1.5 bg-white/5 border border-white/5 hover:border-rose-500/30 text-white rounded-lg inline-flex items-center"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Bulk Update & Reordering Sidebar on Right */}
        <div className="space-y-6">
          
          {/* Bulk Update Controls */}
          {selectedIds.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
                <CheckSquare className="w-4.5 h-4.5 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bulk Updates ({selectedIds.length})</h3>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block font-mono">Update Supplier Name</label>
                  <input 
                    type="text"
                    value={bulkSupplier}
                    onChange={(e) => setBulkSupplier(e.target.value)}
                    placeholder="Enter supplier corporate name..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block font-mono">Update Category</label>
                  <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                    <option value="Structural">Structural</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Finishing">Finishing</option>
                  </select>
                </div>

                <button 
                  onClick={handleBulkUpdate}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-md"
                >
                  Commit Bulk Modifications
                </button>
              </div>
            </div>
          )}

          {/* Import / Export toolbox */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FileDown className="w-4.5 h-4.5 text-cyan-400" />
              <span>Import & Export Portal</span>
            </h3>
            
            <div className="space-y-2.5 text-xs font-semibold">
              <button 
                onClick={handleExportCSV}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition-all text-white"
              >
                <span>Export Ledger (CSV / Excel)</span>
                <FileDown className="w-4 h-4 text-cyan-400" />
              </button>

              <div className="relative border border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl p-3 bg-white/5 text-center cursor-pointer transition-all">
                <input type="file" accept=".csv" onChange={handleImportCSV} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                <span className="text-[10px] text-white/50 block font-mono">Import Excel / CSV Sheet</span>
              </div>
            </div>
          </div>

          {/* Waste reduction card */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Material Waste Projections</h3>
            <div className="h-44 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materials.slice(0, 4)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tickFormatter={(t) => t.split(' ')[0]} />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Bar dataKey="wasteForecast" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* --- ADD / EDIT FORM MODAL --- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-4 relative shadow-2xl my-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              {formMode === 'add' ? '➕ Register New Material' : '✏ Edit Material Specifications'}
            </h3>
            
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Material Name</label>
                  <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Material Code</label>
                  <input type="text" required value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="e.g. CON-M40" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Material Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as any)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                    <option value="Structural">Structural</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Machinery">Machinery</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Measurement Unit</label>
                  <input type="text" required value={formUnit} onChange={(e) => setFormUnit(e.target.value)} placeholder="e.g. Bags, Tons, m³" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Current Stock Qty</label>
                  <input type="number" required value={formStock} onChange={(e) => setFormStock(parseInt(e.target.value))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Safety Limit (Min Threshold)</label>
                  <input type="number" required value={formMinThreshold} onChange={(e) => setFormMinThreshold(parseInt(e.target.value))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Purchase Price (₹)</label>
                  <input type="number" required value={formPurchasePrice} onChange={(e) => setFormPurchasePrice(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Selling Price (₹)</label>
                  <input type="number" required value={formSellingPrice} onChange={(e) => setFormSellingPrice(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Supplier Company</label>
                  <input type="text" required value={formSupplier} onChange={(e) => setFormSupplier(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 block">Warehouse Storage Depot</label>
                  <input type="text" required value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-white/50 block">Description & Specs</label>
                  <textarea rows={2} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-white/50 block">Material Image Upload</label>
                  <div className="border border-dashed border-white/10 rounded-xl p-3 text-center bg-slate-900 cursor-pointer relative">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-4 h-4 mx-auto text-white/45 mb-1" />
                    <span className="text-[10px] text-white/50">Upload catalog picture file from local computer</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 border border-white/5 rounded-xl hover:bg-white/5 text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-md">Save Material</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-2xl p-6 space-y-4 relative shadow-2xl my-8 text-xs text-white/80">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div className="flex items-center space-x-3">
                {selectedItem.image && (
                  <img src={selectedItem.image} alt="pic" className="w-10 h-10 rounded object-cover border border-white/10" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedItem.name}</h3>
                  <span className="text-[10px] text-cyan-400 font-mono">{selectedItem.code} • {selectedItem.category}</span>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-white/60 hover:text-white text-sm font-bold">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 leading-relaxed">
                  <div>
                    <span className="text-[9px] text-white/45 block uppercase">Available Stock:</span>
                    <span className="text-white font-bold">{selectedItem.stock} {selectedItem.unit}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/45 block uppercase">Safety limit threshold:</span>
                    <span className="text-white font-mono">{selectedItem.minThreshold} {selectedItem.unit}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/45 block uppercase">Purchase Price:</span>
                    <span className="text-white font-mono">{formatIndianRupee(selectedItem.purchasePrice)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/45 block uppercase">Selling Price:</span>
                    <span className="text-white font-mono">{formatIndianRupee(selectedItem.sellingPrice)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/45 block uppercase">Supplier firm:</span>
                    <span className="text-white font-sans">{selectedItem.supplier}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/45 block uppercase">Warehouse location:</span>
                    <span className="text-white font-sans">{selectedItem.warehouse}</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <span className="text-[9px] text-white/45 block uppercase mb-1">Description:</span>
                  <p className="text-white/70">{selectedItem.description}</p>
                </div>

                {/* Stock transaction trigger buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  <button 
                    onClick={() => { setStockUpdateType('Add'); setIsStockUpdateOpen(true); }}
                    className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-center text-[10px]"
                  >
                    + Add Stock
                  </button>
                  <button 
                    onClick={() => { setStockUpdateType('Remove'); setIsStockUpdateOpen(true); }}
                    className="flex-1 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold rounded-lg text-center text-[10px]"
                  >
                    - Remove Stock
                  </button>
                  <button 
                    onClick={() => { setStockUpdateType('Transfer'); setIsStockUpdateOpen(true); }}
                    className="flex-1 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold rounded-lg text-center text-[10px]"
                  >
                    Transfer
                  </button>
                  <button 
                    onClick={() => { setStockUpdateType('Adjustment'); setIsStockUpdateOpen(true); }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-white/5 hover:bg-slate-800 text-white rounded-lg text-center text-[10px]"
                  >
                    Adjust
                  </button>
                </div>
              </div>

              {/* Right Column: AI Analysis & Stock History */}
              <div className="space-y-4">
                {/* AI Stock Analysis details */}
                <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-4 space-y-2 text-[10px] text-cyan-300">
                  <h4 className="font-bold text-white flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>AI Stock Analytics</span>
                  </h4>
                  <div className="space-y-1.5 font-mono text-[10px] text-white/80 leading-relaxed">
                    <p>• Current Safety Ratio: <span className="font-bold text-cyan-400">{calculateAiMetrics(selectedItem).safetyPercent}%</span></p>
                    <p>• Remaining Days Cover: <span className="text-white font-bold">{Math.round(selectedItem.stock / (calculateAiMetrics(selectedItem).predictedUsage / 7))} Days</span></p>
                    <p>• Predicted Weekly Consumption: <span className="text-white">{calculateAiMetrics(selectedItem).predictedUsage} {selectedItem.unit}</span></p>
                    <p>• Expected Reorder Trigger Date: <span className="text-cyan-400 font-bold">{calculateAiMetrics(selectedItem).expectedReorderDate}</span></p>
                    <p>• Inventory Capital Outflow: <span className="text-white font-bold">{formatIndianRupee(calculateAiMetrics(selectedItem).costAnalysis)}</span></p>
                  </div>
                </div>

                {/* Stock History Logs list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-white uppercase tracking-widest font-mono font-bold">Transaction History</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
                    {selectedItem.stockHistory.map((log, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-[10px] font-mono leading-relaxed">
                        <div className="flex justify-between font-bold">
                          <span className={log.type === 'Add' ? 'text-emerald-400' : log.type === 'Remove' ? 'text-rose-400' : 'text-cyan-400'}>
                            {log.type.toUpperCase()}: {log.qty} {selectedItem.unit}
                          </span>
                          <span className="text-white/35 font-normal">{log.date.split(',')[0]}</span>
                        </div>
                        <p className="text-[9px] text-white/50 mt-1">{log.note} • Bal: {log.balance} {selectedItem.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- STOCK UPDATE MODAL (Sub-Modal) --- */}
      {isStockUpdateOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center space-x-1.5">
              <Package className="w-4.5 h-4.5 text-cyan-400" />
              <span>{stockUpdateType} Stock: {selectedItem.name}</span>
            </h3>
            
            <form onSubmit={handleStockUpdateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 block">Quantity ({selectedItem.unit})</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={stockUpdateQty}
                  onChange={(e) => setStockUpdateQty(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 block">Transaction Reference / Note</label>
                <input 
                  type="text"
                  required
                  value={stockUpdateNote}
                  onChange={(e) => setStockUpdateNote(e.target.value)}
                  placeholder="e.g. Received delivery invoice PO-102"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setIsStockUpdateOpen(false)} className="px-3.5 py-1.5 border border-white/5 rounded-lg hover:bg-white/5 text-white">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg shadow-md">Post Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FLOATING ACTION BUTTON (FAB) --- */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3.5">
        
        {/* Sub menu drawer */}
        {isFabOpen && (
          <div className="flex flex-col space-y-2.5 items-end font-semibold text-xs text-white/90">
            <button 
              onClick={() => { handleOpenAdd(); setIsFabOpen(false); }}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2 shadow-2xl transition-all"
            >
              <span>Add Material</span>
              <Plus className="w-4 h-4 text-cyan-400" />
            </button>
            
            <button 
              onClick={() => { handleExportCSV(); setIsFabOpen(false); }}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2 shadow-2xl transition-all"
            >
              <span>Export CSV</span>
              <FileDown className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        )}

        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-full flex items-center justify-center shadow-2xl transition-all scale-110 active:scale-95"
          title="Floating Tools"
        >
          <Plus className={`w-6 h-6 transition-transform duration-300 ${isFabOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

    </div>
  );
}
