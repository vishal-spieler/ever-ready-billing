'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Bell, X, Download, Send, Edit2 } from 'lucide-react';

const Logo = ({ width = 140, height = 90, theme = 'light' }) => {
  const color = theme === 'dark' ? '#F0A500' : '#1b2a4a';
  const ringColor = theme === 'dark' ? '#152035' : '#1b2a4a';
  return (
    <svg viewBox="0 0 200 132" width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
      {/* Base horizontal line for structure */}
      <line x1="15" y1="96" x2="185" y2="96" stroke={color} strokeWidth="3" />
      
      {/* Structure Pillars */}
      <rect x="35" y="21" width="10" height="75" fill={color} />
      <rect x="155" y="21" width="10" height="75" fill={color} />
      
      {/* Pillar Bases */}
      <rect x="27" y="90" width="26" height="6" fill={color} />
      <rect x="147" y="90" width="26" height="6" fill={color} />
      <rect x="30" y="86" width="20" height="4" fill={color} />
      <rect x="150" y="86" width="20" height="4" fill={color} />
      
      {/* Pillar Tops */}
      <rect x="32" y="16" width="16" height="5" fill={color} />
      <rect x="152" y="16" width="16" height="5" fill={color} />

      {/* Crossbeam */}
      <rect x="30" y="21" width="140" height="6" fill={color} />
      
      {/* Brackets / Corner Braces */}
      <path d="M 45 27 L 45 42 L 65 27 Z" fill={color} />
      <path d="M 155 27 L 155 42 L 135 27 Z" fill={color} />
      
      {/* Rivet details */}
      <circle cx="39" cy="24" r="2" fill={theme === 'dark' ? '#152035' : 'white'} />
      <circle cx="161" cy="24" r="2" fill={theme === 'dark' ? '#152035' : 'white'} />

      {/* Central Gear */}
      <g transform="translate(100, 56)">
        {/* 12 Outer Gear Teeth */}
        {[...Array(12)].map((_, i) => (
          <rect
            key={i}
            x="-6"
            y="-33"
            width="12"
            height="12"
            fill={color}
            transform={`rotate(${i * 30})`}
            rx="1"
          />
        ))}
        
        {/* Gear Outer Ring */}
        <circle cx="0" cy="0" r="28" fill={color} />
        
        {/* Outer Blue Ring Accent */}
        <circle cx="0" cy="0" r="24" fill="#1d4ed8" stroke={ringColor} strokeWidth="2.5" />
        
        {/* Inner Yellow Lightning Bolt */}
        <polygon points="3,-14  -10,1  -2,1  -5,14  10,-1  2,-1" fill="#fbbf24" stroke={ringColor} strokeWidth="1" />
      </g>

      {/* Text: EVER READY */}
      <text x="100" y="112" textAnchor="middle" fontFamily="'Arial Black', sans-serif" fontSize="16" fontWeight="900" fill={color} letterSpacing="0.5">EVER READY</text>
      
      {/* Text: ENGINEERS */}
      <text x="100" y="125" textAnchor="middle" fontFamily="'Arial', sans-serif" fontSize="9" fontWeight="bold" fill={color} letterSpacing="3.5">ENGINEERS</text>
      
      {/* Underline */}
      <line x1="38" y1="131" x2="162" y2="131" stroke={color} strokeWidth="2" />
    </svg>
  );
};

const EverReadySystem = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clients, setClients] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingQuotationId, setEditingQuotationId] = useState(null);
  
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    paidInvoices: 0,
    outstanding: 0,
    totalClients: 0,
    activity: []
  });

  const [company, setCompany] = useState({
    name: 'EVER READY ENGINEERS',
    address: 'Plate no 192/1, sr.no 1 Nilai nivas Nagarsolapur road, Mirajaon, Ahilyanagar -414402',
    phone: '8888162227',
    email: 'erengieners01@gmail.com',
    gstin: '27FBFD9897L1Z5',
    pan: 'FBFD9897L',
    bankName: 'Ahilyanagar co-operative bank',
    bankBranch: 'Chincholi Kaldat',
    accountName: 'Ever Ready Engineers',
    accountNo: '02161102100018',
    ifscCode: 'AHDC0000216'
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState('invoice');
  const [loading, setLoading] = useState(true);

  const [currentInvoice, setCurrentInvoice] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    clientId: '',
    poNo: '',
    poDate: '',
    items: [{ sr: 1, desc: '', hsn: '', qty: 1, rate: 0, total: 0 }],
    taxType: 'CGST_SGST',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    grossTotal: 0
  });

  const [currentQuotation, setCurrentQuotation] = useState({
    quotationNo: '',
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientId: '',
    items: [{ sr: 1, desc: '', hsn: '', qty: 1, rate: 0, total: 0 }],
    taxType: 'CGST_SGST',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    grossTotal: 0
  });

  const [newClient, setNewClient] = useState({
    name: '',
    contact_person: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    gstin: '',
    pan: ''
  });

  // ═══════════════════════════════════════════════════════════════════
  // DATA FETCHING HOOKS
  // ═══════════════════════════════════════════════════════════════════
  
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (!data.error) setDashboardStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (!data.error) setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (!data.error) setInvoices(data);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    }
  };

  const fetchQuotations = async () => {
    try {
      const res = await fetch('/api/quotations');
      const data = await res.json();
      if (!data.error) setQuotations(data);
    } catch (err) {
      console.error('Failed to fetch quotations', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (!data.error) setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (!data.error && data.name) {
        setCompany(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSettings(),
      fetchClients(),
      fetchInvoices(),
      fetchQuotations(),
      fetchNotifications(),
      fetchDashboardStats()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // CALCULATION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  const calculateTotals = (items, taxType, cgstRate, sgstRate, igstRate) => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

    if (taxType === 'CGST_SGST') {
      cgstAmount = subtotal * (cgstRate / 100);
      sgstAmount = subtotal * (sgstRate / 100);
    } else if (taxType === 'IGST') {
      igstAmount = subtotal * (igstRate / 100);
    }

    const grossTotal = subtotal + cgstAmount + sgstAmount + igstAmount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      igstAmount: parseFloat(igstAmount.toFixed(2)),
      grossTotal: parseFloat(grossTotal.toFixed(2))
    };
  };

  // ═══════════════════════════════════════════════════════════════════
  // INVOICE HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const updateInvoiceItem = (index, field, value) => {
    const items = [...currentInvoice.items];
    items[index][field] = field === 'qty' || field === 'rate' || field === 'sr' ? parseFloat(value) || 0 : value;
    if (field === 'qty' || field === 'rate') {
      items[index].total = (items[index].qty * items[index].rate);
    }
    const totals = calculateTotals(items, currentInvoice.taxType, currentInvoice.cgstRate, currentInvoice.sgstRate, currentInvoice.igstRate);
    setCurrentInvoice({ ...currentInvoice, items, ...totals });
  };

  const addInvoiceItem = () => {
    const items = [...currentInvoice.items, { sr: currentInvoice.items.length + 1, desc: '', hsn: '', qty: 1, rate: 0, total: 0 }];
    const totals = calculateTotals(items, currentInvoice.taxType, currentInvoice.cgstRate, currentInvoice.sgstRate, currentInvoice.igstRate);
    setCurrentInvoice({ ...currentInvoice, items, ...totals });
  };

  const removeInvoiceItem = (index) => {
    const items = currentInvoice.items.filter((_, i) => i !== index);
    const totals = calculateTotals(items, currentInvoice.taxType, currentInvoice.cgstRate, currentInvoice.sgstRate, currentInvoice.igstRate);
    setCurrentInvoice({ ...currentInvoice, items, ...totals });
  };

  const closeInvoiceModal = () => {
    setCurrentInvoice({
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      clientId: '',
      poNo: '',
      poDate: '',
      items: [{ sr: 1, desc: '', hsn: '', qty: 1, rate: 0, total: 0 }],
      taxType: 'CGST_SGST',
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      subtotal: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      grossTotal: 0
    });
    setEditingInvoiceId(null);
    setShowInvoiceModal(false);
  };

  const editInvoice = async (inv) => {
    try {
      const res = await fetch(`/api/invoices?id=${inv.id}`);
      const data = await res.json();
      if (data.error) {
        alert('❌ Error loading invoice: ' + data.error);
        return;
      }
      
      setCurrentInvoice({
        invoiceNo: data.invoiceNo || data.invoice_no,
        invoiceDate: data.invoiceDate || data.invoice_date,
        clientId: data.clientId || data.client_id,
        poNo: data.poNo || data.po_no || '',
        poDate: data.poDate || data.po_date || '',
        items: data.items.map(item => ({
          sr: item.sr,
          desc: item.desc || item.description,
          hsn: item.hsn || '',
          qty: item.qty,
          rate: item.rate,
          total: item.total
        })),
        taxType: data.taxType || data.tax_type || 'CGST_SGST',
        cgstRate: data.cgstRate || data.cgst_rate || 9,
        sgstRate: data.sgstRate || data.sgst_rate || 9,
        igstRate: data.igstRate || data.igst_rate || 18,
        subtotal: data.subtotal,
        cgstAmount: data.cgstAmount || data.cgst_amount || 0,
        sgstAmount: data.sgstAmount || data.sgst_amount || 0,
        igstAmount: data.igstAmount || data.igst_amount || 0,
        grossTotal: data.grossTotal || data.gross_total
      });
      
      setEditingInvoiceId(inv.id);
      setShowInvoiceModal(true);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to load invoice details');
    }
  };

  const saveInvoice = async () => {
    if (!currentInvoice.clientId) { alert('Please select a client'); return; }
    
    try {
      const url = '/api/invoices';
      const method = editingInvoiceId ? 'PUT' : 'POST';
      const body = editingInvoiceId ? { id: editingInvoiceId, ...currentInvoice } : currentInvoice;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.error) {
        alert('❌ Error saving invoice: ' + data.error);
        return;
      }
      
      closeInvoiceModal();
      await fetchInvoices();
      await fetchNotifications();
      await fetchDashboardStats();
      alert(editingInvoiceId ? '✅ Invoice updated!' : '✅ Invoice saved!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to save invoice');
    }
  };

  const deleteInvoice = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const res = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) {
        alert('❌ Error: ' + data.error);
        return;
      }
      await fetchInvoices();
      await fetchNotifications();
      await fetchDashboardStats();
    } catch (err) {
      console.error(err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // QUOTATION HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const updateQuotationItem = (index, field, value) => {
    const items = [...currentQuotation.items];
    items[index][field] = field === 'qty' || field === 'rate' || field === 'sr' ? parseFloat(value) || 0 : value;
    if (field === 'qty' || field === 'rate') {
      items[index].total = (items[index].qty * items[index].rate);
    }
    const totals = calculateTotals(items, currentQuotation.taxType, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate);
    setCurrentQuotation({ ...currentQuotation, items, ...totals });
  };

  const addQuotationItem = () => {
    const items = [...currentQuotation.items, { sr: currentQuotation.items.length + 1, desc: '', hsn: '', qty: 1, rate: 0, total: 0 }];
    const totals = calculateTotals(items, currentQuotation.taxType, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate);
    setCurrentQuotation({ ...currentQuotation, items, ...totals });
  };

  const removeQuotationItem = (index) => {
    const items = currentQuotation.items.filter((_, i) => i !== index);
    const totals = calculateTotals(items, currentQuotation.taxType, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate);
    setCurrentQuotation({ ...currentQuotation, items, ...totals });
  };

  const closeQuotationModal = () => {
    setCurrentQuotation({
      quotationNo: '',
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientId: '',
      items: [{ sr: 1, desc: '', hsn: '', qty: 1, rate: 0, total: 0 }],
      taxType: 'CGST_SGST',
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      subtotal: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      grossTotal: 0,
      status: 'PENDING'
    });
    setEditingQuotationId(null);
    setShowQuotationModal(false);
  };

  const editQuotation = async (quot) => {
    try {
      const res = await fetch(`/api/quotations?id=${quot.id}`);
      const data = await res.json();
      if (data.error) {
        alert('❌ Error loading quotation: ' + data.error);
        return;
      }
      
      setCurrentQuotation({
        quotationNo: data.quotationNo || data.quotation_no,
        quotationDate: data.quotationDate || data.quotation_date,
        validUntil: data.validUntil || data.valid_until,
        clientId: data.clientId || data.client_id,
        items: data.items.map(item => ({
          sr: item.sr,
          desc: item.desc || item.description,
          hsn: item.hsn || '',
          qty: item.qty,
          rate: item.rate,
          total: item.total
        })),
        taxType: data.taxType || data.tax_type || 'CGST_SGST',
        cgstRate: data.cgstRate || data.cgst_rate || 9,
        sgstRate: data.sgstRate || data.sgst_rate || 9,
        igstRate: data.igstRate || data.igst_rate || 18,
        subtotal: data.subtotal,
        cgstAmount: data.cgstAmount || data.cgst_amount || 0,
        sgstAmount: data.sgstAmount || data.sgst_amount || 0,
        igstAmount: data.igstAmount || data.igst_amount || 0,
        grossTotal: data.grossTotal || data.gross_total,
        status: data.status || 'PENDING'
      });
      
      setEditingQuotationId(quot.id);
      setShowQuotationModal(true);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to load quotation details');
    }
  };

  const saveQuotation = async () => {
    if (!currentQuotation.clientId) { alert('Please select a client'); return; }
    
    try {
      const url = '/api/quotations';
      const method = editingQuotationId ? 'PUT' : 'POST';
      const body = editingQuotationId ? { id: editingQuotationId, ...currentQuotation } : currentQuotation;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.error) {
        alert('❌ Error saving quotation: ' + data.error);
        return;
      }
      
      closeQuotationModal();
      await fetchQuotations();
      await fetchNotifications();
      await fetchDashboardStats();
      alert(editingQuotationId ? '✅ Quotation updated!' : '✅ Quotation saved!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to save quotation');
    }
  };

  const deleteQuotation = async (id) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    try {
      const res = await fetch(`/api/quotations?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) {
        alert('❌ Error: ' + data.error);
        return;
      }
      await fetchQuotations();
      await fetchNotifications();
      await fetchDashboardStats();
    } catch (err) {
      console.error(err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // CLIENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const closeClientModal = () => {
    setNewClient({ name: '', contact_person: '', mobile: '', email: '', address: '', city: '', state: '', pin: '', gstin: '', pan: '' });
    setEditingClientId(null);
    setShowClientModal(false);
  };

  const editClient = (client) => {
    setNewClient({
      name: client.name,
      contact_person: client.contact_person || '',
      mobile: client.mobile,
      email: client.email || '',
      address: client.address,
      city: client.city,
      state: client.state || '',
      pin: client.pin,
      gstin: client.gstin || '',
      pan: client.pan || ''
    });
    setEditingClientId(client.id);
    setShowClientModal(true);
  };

  const saveClient = async () => {
    if (!newClient.name || !newClient.mobile || !newClient.address || !newClient.city || !newClient.pin) {
      alert('❌ Please fill all required fields');
      return;
    }
    
    try {
      const url = '/api/clients';
      const method = editingClientId ? 'PUT' : 'POST';
      const body = editingClientId ? { id: editingClientId, ...newClient } : newClient;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.error) {
        alert('❌ Error saving client: ' + data.error);
        return;
      }
      
      closeClientModal();
      await fetchClients();
      await fetchDashboardStats();
      alert(editingClientId ? '✅ Client updated!' : '✅ Client saved!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to add client');
    }
  };

  const deleteClient = async (id) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) {
        alert('❌ Cannot delete client: ' + data.error);
        return;
      }
      await fetchClients();
      await fetchDashboardStats();
    } catch (err) {
      console.error(err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // SETTINGS HANDLER
  // ═══════════════════════════════════════════════════════════════════

  const saveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      });
      const data = await res.json();
      if (data.error) {
        alert('❌ Error saving settings: ' + data.error);
        return;
      }
      setCompany(data);
      alert('✅ Settings saved!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to save settings');
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICATION HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const markNotificationAsRead = async (id) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!data.error) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.error) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ═══════════════════════════════════════════════════════════════════
  // NUMBER TO WORDS
  // ═══════════════════════════════════════════════════════════════════

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero Only';
    let result = '';
    let crore = Math.floor(num / 10000000);
    let lakh = Math.floor((num % 10000000) / 100000);
    let thousand = Math.floor((num % 100000) / 1000);
    let hundred = Math.floor((num % 1000) / 100);
    let rest = Math.floor(num % 100);

    if (crore > 0) result += ones[crore] + ' Crore ';
    if (lakh > 0) result += ones[lakh] + ' Lakh ';
    if (thousand > 0) result += ones[thousand] + ' Thousand ';
    if (hundred > 0) result += ones[hundred] + ' Hundred ';
    
    if (rest >= 20) result += tens[Math.floor(rest / 10)] + (rest % 10 > 0 ? ' ' + ones[rest % 10] : '') + ' ';
    else if (rest > 0) result += (rest < 10 ? ones[rest] : teens[rest - 10]) + ' ';
    
    return result.trim() + ' Only';
  };

  // ═══════════════════════════════════════════════════════════════════
  // DOCUMENT PREVIEW COMPONENT
  // ═══════════════════════════════════════════════════════════════════

  const DocumentPreview = ({ type, data }) => {
    const selectedClient = clients.find(c => c.id == data.clientId);
    const docTitle = type === 'invoice' ? 'INVOICE' : 'QUOTATION';
    const docNumber = type === 'invoice' ? data.invoiceNo : data.quotationNo;
    const docDate = type === 'invoice' ? data.invoiceDate : data.quotationDate;
    const validUntilRow = type === 'quotation' ? (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '11px' }}>
        <span><strong>Valid Until:</strong></span>
        <span>{data.validUntil}</span>
      </div>
    ) : null;

    return (
      <div className="print-document" style={{ background: 'white', color: '#1B2A4A', padding: '40px', borderRadius: '8px', fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.6' }}>
        {/* Header */}
        <div style={{ border: '3px solid #333', padding: '20px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '160px 1fr', gap: '20px', alignItems: 'center' }}>
          <div>
            <Logo width={150} height={98} theme="light" />
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1B2A4A' }}>{company.name}</h1>
            <p style={{ fontSize: '11px', margin: '4px 0', color: '#555' }}>{company.address}</p>
            <p style={{ fontSize: '11px', margin: '2px 0', color: '#555' }}>Mob-{company.phone} , Email -{company.email}</p>
            <p style={{ fontSize: '11px', margin: '2px 0', fontWeight: 'bold', color: '#1B2A4A' }}>GST NO-{company.gstin}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <hr style={{ margin: '8px 0', borderTop: '2px solid #333' }} />
            <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', margin: '0' }}>{docTitle}</p>
          </div>
        </div>

        {/* Client and Document Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>TO,</p>
            {selectedClient && (
              <div style={{ fontSize: '11px' }}>
                <p><strong>{selectedClient.name}</strong></p>
                <p>{selectedClient.address}</p>
                <p>{selectedClient.city} - {selectedClient.pin}</p>
                <p>Mobile: {selectedClient.mobile}</p>
                {selectedClient.gstin && <p>GSTIN: {selectedClient.gstin}</p>}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px' }}>
            <p><strong>{type === 'invoice' ? 'Invoice' : 'Quotation'} Date:</strong> {docDate}</p>
            <p><strong>{type === 'invoice' ? 'Invoice' : 'Quotation'} No.:</strong> {docNumber}</p>
            <p><strong>PO No.:</strong> {data.poNo || '—'}</p>
            <p><strong>PO Date:</strong> {data.poDate || '—'}</p>
            {validUntilRow}
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0', border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ background: '#1B2A4A', color: 'white' }}>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left', fontSize: '10px' }}>Sr. No</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left', fontSize: '10px' }}>Material Description</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left', fontSize: '10px' }}>HSN code</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontSize: '10px' }}>Qty</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'right', fontSize: '10px' }}>Rate</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'right', fontSize: '10px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.map((item, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px' }}>{item.sr}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px' }}>{item.desc}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px' }}>{item.hsn}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px', textAlign: 'right' }}>₹{item.rate.toFixed(2)}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px', textAlign: 'right' }}>₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
          <div>
            <p><strong>Amount In Word -</strong></p>
            <p style={{ fontStyle: 'italic' }}>{numberToWords(data.grossTotal)}</p>
          </div>
          <div style={{ fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
              <span>Total</span><span>₹{data.subtotal.toFixed(2)}</span>
            </div>
            {data.taxType === 'CGST_SGST' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                  <span>CGST @{data.cgstRate}%</span><span>₹{data.cgstAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                  <span>SGST @{data.sgstRate}%</span><span>₹{data.sgstAmount.toFixed(2)}</span>
                </div>
              </>
            ) : data.taxType === 'IGST' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                <span>IGST @{data.igstRate}%</span><span>₹{data.igstAmount.toFixed(2)}</span>
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 'bold', fontSize: '16px', borderTop: '2px solid #1B2A4A', marginTop: '4px' }}>
              <span>Gross Total</span><span>₹{data.grossTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #ddd', fontSize: '11px' }}>
          <p><strong>Account holder -</strong> {company.accountName}</p>
          <p>Account Number - {company.accountNo}</p>
          <p>IFSC Code - {company.ifscCode}</p>
          <p>Bank - {company.bankName}</p>
          <p>Branch - {company.bankBranch}</p>
        </div>

        {/* Signatures */}
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center', fontSize: '10px' }}>
          <div>
            <p style={{ marginBottom: '60px' }}>Receiver</p>
            <p>Stamp & Sign</p>
          </div>
          <div>
            <p style={{ marginBottom: '60px' }}>For EVER READY ENGINEERS</p>
            <p>Stamp & Sign</p>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER MAIN UI
  // ═══════════════════════════════════════════════════════════════════

  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'invoices', label: '🧾 Invoices' },
    { id: 'quotations', label: '📋 Quotations' },
    { id: 'clients', label: '🏢 Clients' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#111d33', color: 'white', alignItems: 'center', justifyContent: 'center', fontFamily: "'Exo 2', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#F0A500', fontSize: '24px', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>⚡ LOADING EVER READY SYSTEM...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111d33', color: 'white', fontFamily: "'Exo 2', sans-serif" }}>
      {/* SIDEBAR */}
      <aside className="no-print" style={{ width: '250px', background: 'linear-gradient(180deg, #0e1829 0%, #152035 100%)', borderRight: '1px solid rgba(240,165,0,.18)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Logo width={140} height={92} theme="dark" />
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                background: currentPage === item.id ? '#F0A500' : 'transparent',
                color: currentPage === item.id ? '#111d33' : '#8a96b0',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid rgba(240,165,0,.18)', paddingTop: '16px', fontSize: '11px' }}>
          <p style={{ fontWeight: 'bold', color: '#F0A500' }}>{company.name}</p>
          <p style={{ color: '#8a96b0', margin: '4px 0' }}>GSTIN: {company.gstin}</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="no-print" style={{ marginLeft: '250px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* TOPBAR */}
        <header style={{ height: '70px', background: 'linear-gradient(90deg, #111d33 0%, #152035 100%)', borderBottom: '1px solid rgba(240,165,0,.18)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '20px', position: 'sticky', top: 0, zIndex: 50 }}>
          <h1 style={{ flex: 1, fontSize: '28px', fontWeight: '700', letterSpacing: '1px' }}>
            {currentPage === 'dashboard' && '📊 Dashboard'}
            {currentPage === 'invoices' && '🧾 Invoices'}
            {currentPage === 'quotations' && '📋 Quotations'}
            {currentPage === 'clients' && '🏢 Clients'}
            {currentPage === 'settings' && '⚙️ Settings'}
          </h1>
          
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: 'rgba(240,165,0,.1)',
              border: '1px solid rgba(240,165,0,.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#F0A500'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {currentPage === 'invoices' && (
            <button
              onClick={() => { setCurrentInvoice({
                invoiceNo: `INV-${invoices.length + 101}`,
                invoiceDate: new Date().toISOString().split('T')[0],
                clientId: '',
                poNo: '',
                poDate: '',
                items: [{ sr: 1, desc: '', hsn: '', qty: 1, rate: 0, total: 0 }],
                taxType: 'CGST_SGST',
                cgstRate: 9,
                sgstRate: 9,
                igstRate: 18,
                subtotal: 0,
                cgstAmount: 0,
                sgstAmount: 0,
                igstAmount: 0,
                grossTotal: 0
              }); setShowInvoiceModal(true); }}
              style={{
                padding: '10px 24px',
                background: '#F0A500',
                color: '#111d33',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              + New Invoice
            </button>
          )}
          {currentPage === 'quotations' && (
            <button
              onClick={() => { setCurrentQuotation({
                quotationNo: `QUO-${quotations.length + 101}`,
                quotationDate: new Date().toISOString().split('T')[0],
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                clientId: '',
                items: [{ sr: 1, desc: '', hsn: '', qty: 1, rate: 0, total: 0 }],
                taxType: 'CGST_SGST',
                cgstRate: 9,
                sgstRate: 9,
                igstRate: 18,
                subtotal: 0,
                cgstAmount: 0,
                sgstAmount: 0,
                igstAmount: 0,
                grossTotal: 0
              }); setShowQuotationModal(true); }}
              style={{
                padding: '10px 24px',
                background: '#F0A500',
                color: '#111d33',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              + New Quotation
            </button>
          )}
          {currentPage === 'clients' && (
            <button
              onClick={() => setShowClientModal(true)}
              style={{
                padding: '10px 24px',
                background: '#F0A500',
                color: '#111d33',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              + Add Client
            </button>
          )}
        </header>

        {/* CONTENT AREA */}
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {/* DASHBOARD PAGE */}
          {currentPage === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Revenue', value: `₹${dashboardStats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  { label: 'Paid Invoices (Simulated)', value: `₹${dashboardStats.paidInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  { label: 'Outstanding (Simulated)', value: `₹${dashboardStats.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  { label: 'Total Clients', value: dashboardStats.totalClients }
                ].map((stat, i) => (
                  <div key={i} style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '24px' }}>
                    <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#8a96b0', marginBottom: '10px' }}>{stat.label}</h3>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#F0A500' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#F0A500' }}>📄 Recent Activity Log</h2>
                {dashboardStats.activity.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#8a96b0' }}>
                    <p>Create invoices, quotations, and manage clients to see activity here</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {dashboardStats.activity.map((act, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#0e1829', borderRadius: '8px', borderLeft: `3px solid ${act.type === 'invoice' ? '#F0A500' : '#3498db'}` }}>
                        <div>
                          <p style={{ fontWeight: '600' }}>
                            {act.type === 'invoice' ? '🧾 Created Invoice' : '📋 Created Quotation'} {act.num}
                          </p>
                          <p style={{ fontSize: '12px', color: '#8a96b0' }}>Client: {act.clientName} | Date: {act.date}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: '700', color: '#F0A500' }}>₹{act.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INVOICES PAGE */}
          {currentPage === 'invoices' && (
            <div>
              {invoices.length === 0 ? (
                <div style={{ background: '#192338', border: '2px dashed rgba(240,165,0,.3)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', color: '#8a96b0' }}>📄 No invoices yet</p>
                  <p style={{ color: '#8a96b0', marginTop: '8px' }}>Click "New Invoice" to create one</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {invoices.map(inv => (
                    <div key={inv.id} style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500' }}>{inv.invoice_no}</p>
                          <p style={{ fontSize: '12px', color: '#8a96b0', marginTop: '4px' }}>{inv.clientName}</p>
                          <p style={{ fontSize: '12px', color: '#8a96b0', marginTop: '4px' }}>{inv.invoice_date}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500' }}>₹{inv.gross_total.toFixed(2)}</p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={async () => { 
                                try {
                                  const res = await fetch(`/api/invoices?id=${inv.id}`);
                                  const data = await res.json();
                                  setPreviewType('invoice');
                                  setCurrentInvoice(data);
                                  setShowPreview(true);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              style={{ padding: '6px', background: 'none', border: 'none', color: '#F0A500', cursor: 'pointer' }}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => editInvoice(inv)}
                              style={{ padding: '6px', background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteInvoice(inv.id)}
                              style={{ padding: '6px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* QUOTATIONS PAGE */}
          {currentPage === 'quotations' && (
            <div>
              {quotations.length === 0 ? (
                <div style={{ background: '#192338', border: '2px dashed rgba(240,165,0,.3)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', color: '#8a96b0' }}>📋 No quotations yet</p>
                  <p style={{ color: '#8a96b0', marginTop: '8px' }}>Click "New Quotation" to create one</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {quotations.map(quot => (
                    <div key={quot.id} style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500' }}>{quot.quotation_no}</p>
                          <p style={{ fontSize: '12px', color: '#8a96b0', marginTop: '4px' }}>{quot.clientName}</p>
                          <p style={{ fontSize: '12px', color: '#8a96b0', marginTop: '4px' }}>Valid until: {quot.valid_until}</p>
                          <span style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(240,165,0,.1)', color: '#F0A500', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginTop: '8px' }}>
                            {quot.status}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500' }}>₹{quot.gross_total.toFixed(2)}</p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/quotations?id=${quot.id}`);
                                  const data = await res.json();
                                  setPreviewType('quotation');
                                  setCurrentQuotation(data);
                                  setShowPreview(true);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              style={{ padding: '6px', background: 'none', border: 'none', color: '#F0A500', cursor: 'pointer' }}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => editQuotation(quot)}
                              style={{ padding: '6px', background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteQuotation(quot.id)}
                              style={{ padding: '6px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CLIENTS PAGE */}
          {currentPage === 'clients' && (
            <div>
              {clients.length === 0 ? (
                <div style={{ background: '#192338', border: '2px dashed rgba(240,165,0,.3)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', color: '#8a96b0' }}>🏢 No clients yet</p>
                  <p style={{ color: '#8a96b0', marginTop: '8px' }}>Click "Add Client" to create one</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {clients.map(client => (
                    <div key={client.id} style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F0A500' }}>{client.name}</h3>
                          <p style={{ fontSize: '11px', color: '#8a96b0', marginTop: '4px' }}>{client.city}, {client.pin}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => editClient(client)}
                            style={{ padding: '6px', background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteClient(client.id)}
                            style={{ padding: '6px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#8a96b0', lineHeight: '1.8' }}>
                        <p>📞 {client.mobile}</p>
                        {client.gstin && <p>🏦 {client.gstin}</p>}
                        {client.pan && <p>🪪 {client.pan}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS PAGE */}
          {currentPage === 'settings' && (
            <div style={{ maxWidth: '600px' }}>
              <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F0A500', marginBottom: '16px' }}>🏢 Company Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {[
                    { label: 'Company Name', key: 'name' },
                    { label: 'GSTIN', key: 'gstin' },
                    { label: 'PAN', key: 'pan' },
                    { label: 'Phone', key: 'phone' },
                    { label: 'Email', key: 'email' }
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                      <input
                        type="text"
                        value={company[field.key] || ''}
                        onChange={(e) => setCompany({ ...company, [field.key]: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Address</label>
                  <textarea
                    value={company.address || ''}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    rows="3"
                    style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px', fontFamily: 'inherit' }}
                  />
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F0A500', marginTop: '24px', marginBottom: '16px' }}>🏦 Bank Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Account Name', key: 'accountName' },
                    { label: 'Account Number', key: 'accountNo' },
                    { label: 'IFSC Code', key: 'ifscCode' },
                    { label: 'Bank Name', key: 'bankName' },
                    { label: 'Branch', key: 'bankBranch', colSpan: true }
                  ].map(field => (
                    <div key={field.key} style={{ gridColumn: field.colSpan ? '1 / -1' : 'auto' }}>
                      <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                      <input
                        type="text"
                        value={company[field.key] || ''}
                        onChange={(e) => setCompany({ ...company, [field.key]: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={saveSettings}
                  style={{
                    marginTop: '24px',
                    padding: '10px 24px',
                    background: '#F0A500',
                    color: '#111d33',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  💾 Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* NOTIFICATIONS PANEL */}
      {showNotifications && (
        <div className="no-print" style={{
          position: 'fixed',
          right: 0,
          top: 70,
          width: '350px',
          height: 'calc(100vh - 70px)',
          background: '#0e1829',
          borderLeft: '1px solid rgba(240,165,0,.18)',
          zIndex: 300,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(240,165,0,.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500' }}>🔔 Notifications</h3>
            <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: '#8a96b0', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {notifications.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#8a96b0' }}>No notifications</p>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  style={{
                    background: '#192338',
                    border: notif.read ? '1px solid rgba(240,165,0,.1)' : '1px solid rgba(240,165,0,.3)',
                    borderLeft: notif.read ? '3px solid rgba(240,165,0,.1)' : '3px solid #F0A500',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                    <p style={{ fontWeight: '600', color: notif.read ? '#8a96b0' : '#F0A500', fontSize: '12px' }}>{notif.title}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '14px' }}
                    >
                      ✕
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#8a96b0', margin: '0 0 4px 0' }}>{notif.message}</p>
                  <p style={{ fontSize: '10px', color: '#8a96b0' }}>{notif.date}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
          <div style={{ background: '#152035', border: '1px solid rgba(240,165,0,.18)', borderRadius: '14px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={closeInvoiceModal} style={{ position: 'absolute', right: '20px', top: '16px', background: 'none', border: 'none', fontSize: '24px', color: '#8a96b0', cursor: 'pointer' }}>✕</button>
            
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#F0A500', marginBottom: '24px' }}>{editingInvoiceId ? '📝 Edit Invoice' : '🧾 Create Invoice'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Invoice No</label>
                <input type="text" value={currentInvoice.invoiceNo} onChange={(e) => setCurrentInvoice({ ...currentInvoice, invoiceNo: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Date</label>
                <input type="date" value={currentInvoice.invoiceDate} onChange={(e) => setCurrentInvoice({ ...currentInvoice, invoiceDate: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Client</label>
                <select value={currentInvoice.clientId} onChange={(e) => setCurrentInvoice({ ...currentInvoice, clientId: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Tax Type</label>
                <select value={currentInvoice.taxType} onChange={(e) => { const totals = calculateTotals(currentInvoice.items, e.target.value, currentInvoice.cgstRate, currentInvoice.sgstRate, currentInvoice.igstRate); setCurrentInvoice({ ...currentInvoice, taxType: e.target.value, ...totals }); }} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: '#F0A500', fontSize: '12px', fontWeight: 'bold' }}>
                  <option value="CGST_SGST">CGST + SGST</option>
                  <option value="IGST">IGST</option>
                  <option value="NONE">No Tax</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>PO No</label>
                <input type="text" value={currentInvoice.poNo} onChange={(e) => setCurrentInvoice({ ...currentInvoice, poNo: e.target.value })} placeholder="e.g. PO-123" style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>PO Date</label>
                <input type="date" value={currentInvoice.poDate} onChange={(e) => setCurrentInvoice({ ...currentInvoice, poDate: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>CGST %</label>
                <input type="number" value={currentInvoice.cgstRate} onChange={(e) => { const totals = calculateTotals(currentInvoice.items, currentInvoice.taxType, parseFloat(e.target.value) || 0, currentInvoice.sgstRate, currentInvoice.igstRate); setCurrentInvoice({ ...currentInvoice, cgstRate: parseFloat(e.target.value) || 0, ...totals }); }} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>SGST %</label>
                <input type="number" value={currentInvoice.sgstRate} onChange={(e) => { const totals = calculateTotals(currentInvoice.items, currentInvoice.taxType, currentInvoice.cgstRate, parseFloat(e.target.value) || 0, currentInvoice.igstRate); setCurrentInvoice({ ...currentInvoice, sgstRate: parseFloat(e.target.value) || 0, ...totals }); }} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F0A500', marginBottom: '12px' }}>📦 Items</h3>
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid rgba(240,165,0,.2)' }}>
                <thead>
                  <tr style={{ background: 'rgba(240,165,0,.08)' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '60px' }}>Sr</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold' }}>Description</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '100px' }}>HSN</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '80px' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '120px' }}>Rate</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '140px' }}>Total</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(240,165,0,.1)' }}>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.sr} onChange={(e) => updateInvoiceItem(idx, 'sr', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input placeholder="Description" value={item.desc} onChange={(e) => updateInvoiceItem(idx, 'desc', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input placeholder="HSN" value={item.hsn} onChange={(e) => updateInvoiceItem(idx, 'hsn', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.qty} onChange={(e) => updateInvoiceItem(idx, 'qty', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.rate} onChange={(e) => updateInvoiceItem(idx, 'rate', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px', background: 'rgba(240,165,0,.08)', fontWeight: 'bold', color: '#F0A500', textAlign: 'right' }}>₹{(item.qty * item.rate).toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}><button onClick={() => removeInvoiceItem(idx)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '14px' }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addInvoiceItem} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>+ Add Item</button>

            <div style={{ background: 'rgba(240,165,0,.06)', border: '1px solid rgba(240,165,0,.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>SUBTOTAL</p><p style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>₹{currentInvoice.subtotal.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>CGST</p><p style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>₹{currentInvoice.cgstAmount.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>SGST</p><p style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>₹{currentInvoice.sgstAmount.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>GRAND TOTAL</p><p style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>₹{currentInvoice.grossTotal.toFixed(2)}</p></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(240,165,0,.2)', paddingTop: '16px' }}>
              <button onClick={closeInvoiceModal} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={() => { setPreviewType('invoice'); setShowPreview(true); }} style={{ padding: '10px 20px', background: 'rgba(240,165,0,.2)', border: '1px solid rgba(240,165,0,.3)', color: '#F0A500', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>👁 Preview</button>
              <button onClick={saveInvoice} style={{ padding: '10px 20px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>✅ Save</button>
            </div>
          </div>
        </div>
      )}

      {/* QUOTATION MODAL */}
      {showQuotationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
          <div style={{ background: '#152035', border: '1px solid rgba(240,165,0,.18)', borderRadius: '14px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={closeQuotationModal} style={{ position: 'absolute', right: '20px', top: '16px', background: 'none', border: 'none', fontSize: '24px', color: '#8a96b0', cursor: 'pointer' }}>✕</button>
            
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#F0A500', marginBottom: '24px' }}>{editingQuotationId ? '📝 Edit Quotation' : '📋 Create Quotation'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Quotation No</label>
                <input type="text" value={currentQuotation.quotationNo} onChange={(e) => setCurrentQuotation({ ...currentQuotation, quotationNo: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Date</label>
                <input type="date" value={currentQuotation.quotationDate} onChange={(e) => setCurrentQuotation({ ...currentQuotation, quotationDate: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Valid Until</label>
                <input type="date" value={currentQuotation.validUntil} onChange={(e) => setCurrentQuotation({ ...currentQuotation, validUntil: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Client</label>
                <select value={currentQuotation.clientId} onChange={(e) => setCurrentQuotation({ ...currentQuotation, clientId: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }}>
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Tax Type</label>
                <select value={currentQuotation.taxType} onChange={(e) => { const totals = calculateTotals(currentQuotation.items, e.target.value, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate); setCurrentQuotation({ ...currentQuotation, taxType: e.target.value, ...totals }); }} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: '#F0A500', fontSize: '12px', fontWeight: 'bold' }}>
                  <option value="CGST_SGST">CGST + SGST</option>
                  <option value="IGST">IGST</option>
                  <option value="NONE">No Tax</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>CGST %</label>
                <input type="number" value={currentQuotation.cgstRate} onChange={(e) => { const totals = calculateTotals(currentQuotation.items, currentQuotation.taxType, parseFloat(e.target.value) || 0, currentQuotation.sgstRate, currentQuotation.igstRate); setCurrentQuotation({ ...currentQuotation, cgstRate: parseFloat(e.target.value) || 0, ...totals }); }} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>SGST %</label>
                <input type="number" value={currentQuotation.sgstRate} onChange={(e) => { const totals = calculateTotals(currentQuotation.items, currentQuotation.taxType, currentQuotation.cgstRate, parseFloat(e.target.value) || 0, currentQuotation.igstRate); setCurrentQuotation({ ...currentQuotation, sgstRate: parseFloat(e.target.value) || 0, ...totals }); }} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Status</label>
                <select value={currentQuotation.status || 'PENDING'} onChange={(e) => setCurrentQuotation({ ...currentQuotation, status: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: '#F0A500', fontSize: '12px', fontWeight: 'bold' }}>
                  <option value="PENDING">PENDING</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="DECLINED">DECLINED</option>
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F0A500', marginBottom: '12px' }}>📦 Items</h3>
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid rgba(240,165,0,.2)' }}>
                <thead>
                  <tr style={{ background: 'rgba(240,165,0,.08)' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '60px' }}>Sr</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold' }}>Description</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '100px' }}>HSN</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '80px' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '120px' }}>Rate</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '140px' }}>Total</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentQuotation.items.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(240,165,0,.1)' }}>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.sr} onChange={(e) => updateQuotationItem(idx, 'sr', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input placeholder="Description" value={item.desc} onChange={(e) => updateQuotationItem(idx, 'desc', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input placeholder="HSN" value={item.hsn} onChange={(e) => updateQuotationItem(idx, 'hsn', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.qty} onChange={(e) => updateQuotationItem(idx, 'qty', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.rate} onChange={(e) => updateQuotationItem(idx, 'rate', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px', background: 'rgba(240,165,0,.08)', fontWeight: 'bold', color: '#F0A500', textAlign: 'right' }}>₹{(item.qty * item.rate).toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}><button onClick={() => removeQuotationItem(idx)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '14px' }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addQuotationItem} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>+ Add Item</button>

            <div style={{ background: 'rgba(240,165,0,.06)', border: '1px solid rgba(240,165,0,.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>SUBTOTAL</p><p style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>₹{currentQuotation.subtotal.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>CGST</p><p style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>₹{currentQuotation.cgstAmount.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>SGST</p><p style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>₹{currentQuotation.sgstAmount.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>GRAND TOTAL</p><p style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>₹{currentQuotation.grossTotal.toFixed(2)}</p></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(240,165,0,.2)', paddingTop: '16px' }}>
              <button onClick={closeQuotationModal} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={() => { setPreviewType('quotation'); setShowPreview(true); }} style={{ padding: '10px 20px', background: 'rgba(240,165,0,.2)', border: '1px solid rgba(240,165,0,.3)', color: '#F0A500', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>👁 Preview</button>
              <button onClick={saveQuotation} style={{ padding: '10px 20px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>✅ Save</button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT MODAL */}
      {showClientModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
          <div style={{ background: '#152035', border: '1px solid rgba(240,165,0,.18)', borderRadius: '14px', width: '100%', maxWidth: '700px', padding: '32px', position: 'relative' }}>
            <button onClick={closeClientModal} style={{ position: 'absolute', right: '20px', top: '16px', background: 'none', border: 'none', fontSize: '24px', color: '#8a96b0', cursor: 'pointer' }}>✕</button>
            
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#F0A500', marginBottom: '24px' }}>{editingClientId ? '📝 Edit Client Details' : '🏢 Add Client'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Company Name *</label>
                <input type="text" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Contact Person</label>
                <input type="text" value={newClient.contact_person} onChange={(e) => setNewClient({ ...newClient, contact_person: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Mobile *</label>
                <input type="text" value={newClient.mobile} onChange={(e) => setNewClient({ ...newClient, mobile: e.target.value })} maxLength="10" style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Email</label>
                <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Address *</label>
                <input type="text" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>City *</label>
                <input type="text" value={newClient.city} onChange={(e) => setNewClient({ ...newClient, city: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>State</label>
                <input type="text" value={newClient.state} onChange={(e) => setNewClient({ ...newClient, state: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Pincode *</label>
                <input type="text" value={newClient.pin} onChange={(e) => setNewClient({ ...newClient, pin: e.target.value })} maxLength="6" style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>GSTIN</label>
                <input type="text" value={newClient.gstin} onChange={(e) => setNewClient({ ...newClient, gstin: e.target.value.toUpperCase() })} maxLength="15" style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px', textTransform: 'uppercase' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>PAN</label>
                <input type="text" value={newClient.pan} onChange={(e) => setNewClient({ ...newClient, pan: e.target.value.toUpperCase() })} maxLength="10" style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px', textTransform: 'uppercase' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(240,165,0,.2)', paddingTop: '16px' }}>
              <button onClick={closeClientModal} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={saveClient} style={{ padding: '10px 20px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>💾 Save Client</button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
          <div className="print-modal-container" style={{ background: '#152035', border: '1px solid rgba(240,165,0,.18)', borderRadius: '14px', width: '100%', maxWidth: '950px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <div className="no-print" style={{ display: 'flex', gap: '12px', marginBottom: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => window.print()} style={{ padding: '10px 20px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={16} /> Print / PDF
                </button>
              </div>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#8a96b0', cursor: 'pointer' }}>✕</button>
            </div>
            <DocumentPreview type={previewType} data={previewType === 'invoice' ? currentInvoice : currentQuotation} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EverReadySystem;
