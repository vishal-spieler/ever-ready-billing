'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Eye, Bell, X, Download, Send, Edit2,
  Search, Filter, RefreshCw, MessageSquare, Calendar,
  CreditCard, Landmark, CheckCircle, FileSpreadsheet, Share2, Printer, ChevronRight, FileText, Upload
} from 'lucide-react';
import { exportToExcel, exportInvoicePDF, exportReceiptPDF, exportLedgerPDF, numberToWords } from '@/lib/exporter';

const Logo = ({ width = 140, height = 90, theme = 'light' }) => {
  const color = theme === 'dark' ? '#F0A500' : '#1b2a4a';
  const ringColor = theme === 'dark' ? '#152035' : '#1b2a4a';
  return (
    <svg viewBox="0 0 200 132" width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
      <line x1="15" y1="96" x2="185" y2="96" stroke={color} strokeWidth="3" />
      <rect x="35" y="21" width="10" height="75" fill={color} />
      <rect x="155" y="21" width="10" height="75" fill={color} />
      <rect x="27" y="90" width="26" height="6" fill={color} />
      <rect x="147" y="90" width="26" height="6" fill={color} />
      <rect x="30" y="86" width="20" height="4" fill={color} />
      <rect x="150" y="86" width="20" height="4" fill={color} />
      <rect x="32" y="16" width="16" height="5" fill={color} />
      <rect x="152" y="16" width="16" height="5" fill={color} />
      <rect x="30" y="21" width="140" height="6" fill={color} />
      <path d="M 45 27 L 45 42 L 65 27 Z" fill={color} />
      <path d="M 155 27 L 155 42 L 135 27 Z" fill={color} />
      <circle cx="39" cy="24" r="2" fill={theme === 'dark' ? '#152035' : 'white'} />
      <circle cx="161" cy="24" r="2" fill={theme === 'dark' ? '#152035' : 'white'} />
      <g transform="translate(100, 56)">
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
        <circle cx="0" cy="0" r="28" fill={color} />
        <circle cx="0" cy="0" r="24" fill="#1d4ed8" stroke={ringColor} strokeWidth="2.5" />
        <polygon points="3,-14  -10,1  -2,1  -5,14  10,-1  2,-1" fill="#fbbf24" stroke={ringColor} strokeWidth="1" />
      </g>
      <text x="100" y="112" textAnchor="middle" fontFamily="'Arial Black', sans-serif" fontSize="16" fontWeight="900" fill={color} letterSpacing="0.5">EVER READY</text>
      <text x="100" y="125" textAnchor="middle" fontFamily="'Arial', sans-serif" fontSize="9" fontWeight="bold" fill={color} letterSpacing="3.5">ENGINEERS</text>
      <line x1="38" y1="131" x2="162" y2="131" stroke={color} strokeWidth="2" />
    </svg>
  );
};

const CompanyStamp = ({ size = 130 }) => (
  <img src="/stamp.png" alt="Company Stamp" style={{ width: size, height: size, objectFit: 'contain' }} />
);



const EverReadySystem = () => {
  const [currentPage, setCurrentPage] = useState('dashboard'); // dashboard, invoices, quotations, clients, settings, ledger, reports, invoice-detail
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [uploadedPOs, setUploadedPOs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clients, setClients] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const triggerConfirm = (title, message, onConfirm) => {
    setConfirmConfig({ title, message, onConfirm });
  };

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');


  // Detail Invoice selection
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [detailedInvoice, setDetailedInvoice] = useState(null);
  const [detailedComments, setDetailedComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  // PO upload references and states
  const poInputRef = useRef(null);
  const [uploadingPOInvoiceId, setUploadingPOInvoiceId] = useState(null);
  const [uploadingFilePOId, setUploadingFilePOId] = useState(null);

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
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

  // Modals visibility
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);
  const [showUploadPOModal, setShowUploadPOModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [previewType, setPreviewType] = useState('invoice'); // invoice, quotation, purchase_order, ledger, receipt
  const [editingClientId, setEditingClientId] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingQuotationId, setEditingQuotationId] = useState(null);
  const [editingPurchaseOrderId, setEditingPurchaseOrderId] = useState(null);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    clientId: '',
    poNo: '',
    poDate: '',
    items: [{ sr: 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }],
    taxType: 'CGST_SGST',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    subtotal: 0,
    discount: 0,
    transportCharges: 0,
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
    items: [{ sr: 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }],
    taxType: 'CGST_SGST',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    subtotal: 0,
    discount: 0,
    transportCharges: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    grossTotal: 0
  });

  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState({
    poNo: '',
    poDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientId: '',
    vendor_or_client: 'CLIENT',
    items: [{ sr: 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }],
    taxType: 'CGST_SGST',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    subtotal: 0,
    discount: 0,
    transportCharges: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    grossTotal: 0
  });

  const [currentUploadedPO, setCurrentUploadedPO] = useState({
    clientId: '',
    vendor_or_client: 'CLIENT',
    fileName: '',
    fileType: '',
    fileData: '',
    notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Payment Form State
  const [currentPayment, setCurrentPayment] = useState({
    invoiceId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMode: 'UPI',
    referenceNumber: '',
    notes: ''
  });

  // Client Statement Ledger state
  const [selectedLedgerClientId, setSelectedLedgerClientId] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [selectedClientOverview, setSelectedClientOverview] = useState(null);
  const [clientOverviewTab, setClientOverviewTab] = useState('invoices');
  const [clientOverviewDateFrom, setClientOverviewDateFrom] = useState('');
  const [clientOverviewDateTo, setClientOverviewDateTo] = useState('');
  const [clientOverviewPage, setClientOverviewPage] = useState(1);
  const CLIENT_OVERVIEW_PAGE_SIZE = 6;

  // Reports state
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  // ═══════════════════════════════════════════════════════════════════
  // ADVANCED FILTERS AND SEARCH STATE
  // ═══════════════════════════════════════════════════════════════════
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [filterGstType, setFilterGstType] = useState(''); // CGST_SGST, IGST, NONE

  // Debouncing Search Query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // URL query parameter synchronization
  useEffect(() => {
    // Initial load from URL search params
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page) setCurrentPage(page);

    const search = params.get('search');
    if (search) setSearchQuery(search);

    const client = params.get('client');
    if (client) setFilterClient(client);

    const status = params.get('status');
    if (status) setFilterStatus(status);

    const mode = params.get('mode');
    if (mode) setFilterMode(mode);

    const start = params.get('startDate');
    if (start) setFilterStartDate(start);

    const end = params.get('endDate');
    if (end) setFilterEndDate(end);
  }, []);

  // Update URL Search Parameters on filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage) params.set('page', currentPage);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filterClient) params.set('client', filterClient);
    if (filterStatus) params.set('status', filterStatus);
    if (filterMode) params.set('mode', filterMode);
    if (filterStartDate) params.set('startDate', filterStartDate);
    if (filterEndDate) params.set('endDate', filterEndDate);

    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.pushState(null, '', newRelativePathQuery);
  }, [currentPage, debouncedSearch, filterClient, filterStatus, filterMode, filterStartDate, filterEndDate]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterClient('');
    setFilterStatus('');
    setFilterMode('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setFilterGstType('');
    showToast('Filters reset successfully', 'info');
  };

  // ═══════════════════════════════════════════════════════════════════
  // DATA ACTIONS
  // ═══════════════════════════════════════════════════════════════════
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOutstanding: 0,
    thisMonthCollections: 0,
    overdueAmount: 0,
    paidCount: 0,
    partialCount: 0,
    unpaidCount: 0,
    totalClients: 0,
    recentPayments: [],
    overdueInvoicesList: [],
    highValueClients: []
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSettings(),
        fetchClients(),
        fetchInvoices(),
        fetchQuotations(),
        fetchPurchaseOrders(),
        fetchUploadedPOs(),
        fetchNotifications()
      ]);
    } catch (err) {
      console.error(err);
      showToast('Error loading application data', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check auth
    if (localStorage.getItem('ever_ready_auth') === 'true') {
      setIsAuthenticated(true);
      loadAllData();
    } else {
      setLoading(false);
    }
  }, []);

  // Recalculates stats on invoice or client updates
  useEffect(() => {
    if (invoices.length > 0) {
      calculateDashboardStats();
    }
  }, [invoices]);

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (!data.error && data.name) setCompany(data);
  };

  const fetchClients = async () => {
    const res = await fetch(`/api/clients?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    if (!data.error && Array.isArray(data)) setClients(data);
  };

  const fetchPurchaseOrders = async () => {
    const res = await fetch(`/api/purchase-orders?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    if (!data.error && Array.isArray(data)) setPurchaseOrders(data);
  };

  const fetchUploadedPOs = async () => {
    const res = await fetch(`/api/uploaded-pos?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    if (!data.error && Array.isArray(data)) setUploadedPOs(data);
  };

  const fetchInvoices = async () => {
    const res = await fetch(`/api/invoices?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    if (!data.error && Array.isArray(data)) setInvoices(data);
  };

  const fetchQuotations = async () => {
    const res = await fetch(`/api/quotations?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    if (!data.error && Array.isArray(data)) setQuotations(data);
  };

  const fetchNotifications = async () => {
    const res = await fetch(`/api/notifications?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    if (!data.error && Array.isArray(data)) setNotifications(data);
  };

  const calculateDashboardStats = async () => {
    // 1. Calculations
    let totalRevenue = 0;
    let totalOutstanding = 0;
    let thisMonthCollections = 0;
    let overdueAmount = 0;
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Fetch payments list
    const pRes = await fetch('/api/payments');
    const allPayments = await pRes.json();
    const payments = Array.isArray(allPayments) ? allPayments : [];

    // Monthly collections
    payments.forEach(p => {
      const pDate = new Date(p.payment_date);
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        thisMonthCollections += p.amount;
      }
    });

    invoices.forEach(inv => {
      totalRevenue += inv.gross_total;
      totalOutstanding += inv.remaining_amount;

      if (inv.payment_status === 'PAID') paidCount++;
      else if (inv.payment_status === 'PARTIAL') partialCount++;
      else unpaidCount++;

      // Check if overdue: outstanding balance exists and date is older than 30 days
      const invDate = new Date(inv.invoice_date);
      const diffDays = Math.ceil((now - invDate) / (1000 * 60 * 60 * 24));
      if (inv.remaining_amount > 0 && diffDays > 30) {
        overdueAmount += inv.remaining_amount;
      }
    });

    // Overdue invoices list
    const overdueInvoicesList = invoices.filter(inv => {
      const diffDays = Math.ceil((now - new Date(inv.invoice_date)) / (1000 * 60 * 60 * 24));
      return inv.remaining_amount > 0 && diffDays > 30;
    }).slice(0, 5);

    // High value clients calculation
    const clientRevenueMap = {};
    invoices.forEach(inv => {
      clientRevenueMap[inv.clientName] = (clientRevenueMap[inv.clientName] || 0) + inv.gross_total;
    });
    const highValueClients = Object.entries(clientRevenueMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    setDashboardStats({
      totalRevenue,
      totalOutstanding,
      thisMonthCollections,
      overdueAmount,
      paidCount,
      partialCount,
      unpaidCount,
      totalClients: clients.length,
      recentPayments: payments.slice(0, 5),
      overdueInvoicesList,
      highValueClients
    });
  };

  // ═══════════════════════════════════════════════════════════════════
  // CLIENT LEDGER CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════
  const generateLedger = async (clientId) => {
    if (!clientId) return;

    try {
      // Find invoices of the client
      const clientInvoices = invoices.filter(inv => inv.client_id == clientId);
      // Fetch client payments
      const pRes = await fetch(`/api/payments`);
      const allPayments = await pRes.json();

      if (allPayments.error || !Array.isArray(allPayments)) {
        showToast('Error loading ledger details: ' + (allPayments.error || 'Invalid API response'), 'error');
        setLedgerEntries([]);
        return;
      }

      const clientPayments = allPayments.filter(p => {
        // match invoice
        const inv = invoices.find(i => i.id === p.invoice_id);
        return inv && inv.client_id == clientId;
      });

      const entries = [];

      clientInvoices.forEach(inv => {
        entries.push({
          date: inv.invoice_date,
          description: `Invoice ${inv.invoice_no}`,
          debit: inv.gross_total,
          credit: 0,
          timestamp: new Date(inv.invoice_date).getTime()
        });
      });

      clientPayments.forEach(p => {
        const inv = invoices.find(i => i.id === p.invoice_id);
        entries.push({
          date: p.payment_date,
          description: `Payment received for ${inv ? inv.invoice_no : 'invoice'} (${p.payment_mode})`,
          debit: 0,
          credit: p.amount,
          timestamp: new Date(p.payment_date).getTime()
        });
      });

      // Sort chronological
      entries.sort((a, b) => a.timestamp - b.timestamp);

      // Calculate running balance
      let balance = 0;
      const finalEntries = entries.map(entry => {
        balance += (entry.debit - entry.credit);
        return {
          ...entry,
          balance
        };
      });

      setLedgerEntries(finalEntries);
    } catch (err) {
      console.error(err);
      showToast('Failed to load ledger statements', 'error');
    }
  };

  useEffect(() => {
    if (selectedLedgerClientId) {
      generateLedger(selectedLedgerClientId);
    }
  }, [selectedLedgerClientId, invoices]);

  // ═══════════════════════════════════════════════════════════════════
  // DETAILED INVOICE & TIMELINE AUDIT ACTIONS
  // ═══════════════════════════════════════════════════════════════════
  const viewInvoiceDetail = async (id) => {
    setSelectedInvoiceId(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices?id=${id}`);
      const data = await res.json();

      if (data.error) {
        showToast('Error loading invoice details: ' + data.error, 'error');
        setLoading(false);
        return;
      }

      setDetailedInvoice(data);

      const commentsRes = await fetch(`/api/comments?invoiceId=${id}`);
      const commentsData = await commentsRes.json();
      setDetailedComments(Array.isArray(commentsData) ? commentsData : []);

      setCurrentPage('invoice-detail');
    } catch (err) {
      console.error(err);
      showToast('Error fetching invoice details', 'error');
    }
    setLoading(false);
  };

  const addComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoiceId,
          comment: newCommentText,
          commentType: 'NOTE'
        })
      });
      const data = await res.json();
      setDetailedComments([data, ...detailedComments]);
      setNewCommentText('');
      showToast('Comment added', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to post comment', 'error');
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // INVOICE CRUDS
  // ═══════════════════════════════════════════════════════════════════
  const calculateTotals = (items, taxType, cgstRate, sgstRate, igstRate, discount = 0, transportCharges = 0, isItemLevelTax = false) => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const discountVal = parseFloat(discount) || 0;
    const transportVal = parseFloat(transportCharges) || 0;
    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

    if (isItemLevelTax) {
      const discountRatio = subtotal > 0 ? (subtotal - discountVal) / subtotal : 1;
      items.forEach(item => {
        const itemSubtotal = item.qty * item.rate;
        const discountedSubtotal = itemSubtotal * discountRatio;
        const itemCgstRate = item.cgstRate !== undefined ? parseFloat(item.cgstRate) : 9;
        const itemSgstRate = item.sgstRate !== undefined ? parseFloat(item.sgstRate) : 9;
        cgstAmount += discountedSubtotal * (itemCgstRate / 100);
        sgstAmount += discountedSubtotal * (itemSgstRate / 100);
      });
    } else {
      const taxableAmount = Math.max(0, subtotal - discountVal);
      if (taxType === 'CGST_SGST') {
        cgstAmount = taxableAmount * (cgstRate / 100);
        sgstAmount = taxableAmount * (sgstRate / 100);
      } else if (taxType === 'IGST') {
        igstAmount = taxableAmount * (igstRate / 100);
      }
    }

    const grossTotal = Math.max(0, subtotal - discountVal) + cgstAmount + sgstAmount + igstAmount + transportVal;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      igstAmount: parseFloat(igstAmount.toFixed(2)),
      grossTotal: parseFloat(grossTotal.toFixed(2))
    };
  };

  const getItemTaxAmount = (item, taxType, discount, itemsList, igstRate = 18) => {
    const subtotal = itemsList.reduce((sum, it) => sum + (it.qty * it.rate), 0);
    const discountVal = parseFloat(discount) || 0;
    const discountRatio = subtotal > 0 ? (subtotal - discountVal) / subtotal : 1;
    const itemSubtotal = item.qty * item.rate;
    const taxableSubtotal = itemSubtotal * discountRatio;

    let taxRate = 0;
    if (taxType === 'CGST_SGST') {
      const cgst = item.cgstRate !== undefined ? parseFloat(item.cgstRate) : 9;
      const sgst = item.sgstRate !== undefined ? parseFloat(item.sgstRate) : 9;
      taxRate = cgst + sgst;
    } else if (taxType === 'IGST') {
      taxRate = parseFloat(igstRate) || 18;
    }

    return parseFloat((taxableSubtotal * (taxRate / 100)).toFixed(2));
  };

  const updateInvoiceItem = (index, field, value) => {
    const items = [...currentInvoice.items];
    items[index][field] = field === 'qty' || field === 'rate' || field === 'sr' || field === 'cgstRate' || field === 'sgstRate' ? parseFloat(value) || 0 : value;
    if (field === 'qty' || field === 'rate') {
      items[index].total = (items[index].qty * items[index].rate);
    }
    const totals = calculateTotals(items, currentInvoice.taxType, currentInvoice.cgstRate, currentInvoice.sgstRate, currentInvoice.igstRate, currentInvoice.discount, currentInvoice.transportCharges, true);
    setCurrentInvoice({ ...currentInvoice, items, ...totals });
  };

  const addInvoiceItem = () => {
    const items = [...currentInvoice.items, { sr: currentInvoice.items.length + 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }];
    const totals = calculateTotals(items, currentInvoice.taxType, currentInvoice.cgstRate, currentInvoice.sgstRate, currentInvoice.igstRate, currentInvoice.discount, currentInvoice.transportCharges, true);
    setCurrentInvoice({ ...currentInvoice, items, ...totals });
  };

  const removeInvoiceItem = (index) => {
    const items = currentInvoice.items.filter((_, i) => i !== index);
    const totals = calculateTotals(items, currentInvoice.taxType, currentInvoice.cgstRate, currentInvoice.sgstRate, currentInvoice.igstRate, currentInvoice.discount, currentInvoice.transportCharges, true);
    setCurrentInvoice({ ...currentInvoice, items, ...totals });
  };

  const closeInvoiceModal = () => {
    setCurrentInvoice({
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      clientId: '',
      poNo: '',
      poDate: '',
      items: [{ sr: 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }],
      taxType: 'CGST_SGST',
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      subtotal: 0,
      discount: 0,
      transportCharges: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      grossTotal: 0,
      recordPayment: false,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentAmount: '',
      paymentMode: 'UPI',
      paymentRef: ''
    });
    setEditingInvoiceId(null);
    setShowInvoiceModal(false);
  };

  const editInvoice = async (inv) => {
    try {
      const res = await fetch(`/api/invoices?id=${inv.id}`);
      const data = await res.json();
      if (data.error) {
        showToast('Error loading invoice: ' + data.error, 'error');
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
          uom: item.uom || 'Nos',
          qty: item.qty,
          rate: item.rate,
          total: item.total,
          cgstRate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
          sgstRate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9)
        })),
        taxType: data.taxType || data.tax_type || 'CGST_SGST',
        cgstRate: data.cgstRate || data.cgst_rate || 9,
        sgstRate: data.sgstRate || data.sgst_rate || 9,
        igstRate: data.igstRate || data.igst_rate || 18,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        transportCharges: data.transportCharges || data.transport_charges || 0,
        cgstAmount: data.cgstAmount || data.cgst_amount || 0,
        sgstAmount: data.sgstAmount || data.sgst_amount || 0,
        igstAmount: data.igstAmount || data.igst_amount || 0,
        grossTotal: data.grossTotal || data.gross_total,
        total_paid: data.total_paid || 0,
        remaining_amount: data.remaining_amount !== undefined ? data.remaining_amount : (data.grossTotal || data.gross_total || 0)
      });

      setEditingInvoiceId(inv.id);
      setShowInvoiceModal(true);
    } catch (err) {
      console.error(err);
      showToast('Failed to load invoice details', 'error');
    }
  };

  const saveInvoice = async () => {
    if (!currentInvoice.clientId) { showToast('Please select a client', 'warning'); return; }

    try {
      const url = '/api/invoices';
      const method = editingInvoiceId ? 'PUT' : 'POST';

      let invoiceData = { ...currentInvoice };
      if (!editingInvoiceId && currentInvoice.recordPayment) {
        invoiceData.initialPayment = {
          paymentDate: currentInvoice.paymentDate || new Date().toISOString().split('T')[0],
          amount: parseFloat(currentInvoice.paymentAmount !== undefined && currentInvoice.paymentAmount !== '' ? currentInvoice.paymentAmount : currentInvoice.grossTotal) || 0,
          paymentMode: currentInvoice.paymentMode || 'UPI',
          referenceNumber: currentInvoice.paymentRef || '',
          notes: 'Initial payment recorded during invoice generation'
        };
      }

      const body = editingInvoiceId ? { id: editingInvoiceId, ...currentInvoice } : invoiceData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error saving invoice: ' + data.error, 'error');
        return;
      }

      closeInvoiceModal();
      await fetchInvoices();
      await fetchNotifications();
      showToast(editingInvoiceId ? 'Invoice updated!' : 'Invoice created successfully!', 'success');

      // If we are currently in invoice detail view, refresh detail view
      if (selectedInvoiceId && editingInvoiceId === selectedInvoiceId) {
        viewInvoiceDetail(selectedInvoiceId);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save invoice', 'error');
    }
  };

  const deleteInvoice = async (id) => {
    triggerConfirm(
      'Delete Invoice',
      'Are you sure you want to delete this invoice? This action is irreversible.',
      async () => {
        try {
          const res = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.error) {
            showToast('Error deleting invoice: ' + data.error, 'error');
            return;
          }
          await fetchInvoices();
          await fetchNotifications();
          showToast('Invoice deleted', 'success');
          if (currentPage === 'invoice-detail') {
            setCurrentPage('invoices');
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to delete invoice', 'error');
        }
      }
    );
  };

  const triggerPOUpload = (invoiceId) => {
    setUploadingPOInvoiceId(invoiceId);
    if (poInputRef.current) {
      poInputRef.current.value = ''; // Reset file input
      poInputRef.current.click();
    }
  };

  const triggerFilePOUpload = (poId) => {
    setUploadingFilePOId(poId);
    if (poInputRef.current) {
      poInputRef.current.value = ''; // Reset file input
      poInputRef.current.click();
    }
  };

  const handlePOFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (uploadingPOInvoiceId) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target.result.split(',')[1];
        try {
          const res = await fetch('/api/invoices/upload-po', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: uploadingPOInvoiceId,
              fileName: file.name,
              fileType: file.type,
              fileData: base64String
            })
          });
          const data = await res.json();
          if (data.error) {
            showToast('Error uploading PO: ' + data.error, 'error');
          } else {
            showToast('PO uploaded successfully!', 'success');
            fetchInvoices();
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to upload PO', 'error');
        } finally {
          setUploadingPOInvoiceId(null);
        }
      };
      reader.readAsDataURL(file);
    } else if (uploadingFilePOId) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target.result.split(',')[1];
        try {
          const res = await fetch('/api/purchase-orders/upload-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: uploadingFilePOId,
              fileName: file.name,
              fileType: file.type,
              fileData: base64String
            })
          });
          const data = await res.json();
          if (data.error) {
            showToast('Error uploading file: ' + data.error, 'error');
          } else {
            showToast('File uploaded successfully!', 'success');
            fetchPurchaseOrders();
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to upload file', 'error');
        } finally {
          setUploadingFilePOId(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteInvoicePO = async (id) => {
    triggerConfirm(
      'Delete PO File',
      'Are you sure you want to delete the attached PO file?',
      async () => {
        try {
          const res = await fetch('/api/invoices/delete-po', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data.error) {
            showToast('Error deleting PO: ' + data.error, 'error');
          } else {
            showToast('PO deleted successfully!', 'success');
            fetchInvoices();
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to delete PO', 'error');
        }
      }
    );
  };

  const deletePurchaseOrderFile = async (id) => {
    triggerConfirm(
      'Delete Attached File',
      'Are you sure you want to delete the attached file for this Purchase Order?',
      async () => {
        try {
          const res = await fetch('/api/purchase-orders/delete-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data.error) {
            showToast('Error deleting file: ' + data.error, 'error');
          } else {
            showToast('File deleted successfully!', 'success');
            fetchPurchaseOrders();
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to delete file', 'error');
        }
      }
    );
  };

  const markFullyPaid = async (inv) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: inv.id,
          paymentDate: new Date().toISOString().split('T')[0],
          amount: inv.remaining_amount,
          paymentMode: 'BANK_TRANSFER',
          referenceNumber: 'AUTO-PAID',
          notes: 'Marked fully paid from actions panel'
        })
      });
      await res.json();
      await fetchInvoices();
      showToast('Invoice marked as fully paid', 'success');
      if (currentPage === 'invoice-detail') {
        viewInvoiceDetail(inv.id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to mark fully paid', 'error');
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // PAYMENTS ACTIONS
  // ═══════════════════════════════════════════════════════════════════
  const openAddPaymentModal = (inv) => {
    setCurrentPayment({
      invoiceId: inv.id,
      paymentDate: new Date().toISOString().split('T')[0],
      amount: inv.remaining_amount > 0 ? inv.remaining_amount : '',
      paymentMode: 'UPI',
      referenceNumber: '',
      notes: ''
    });
    setEditingPaymentId(null);
    setShowPaymentModal(true);
  };

  const openEditPaymentModal = (pay) => {
    setCurrentPayment({
      invoiceId: pay.invoice_id,
      paymentDate: pay.payment_date,
      amount: pay.amount,
      paymentMode: pay.payment_mode,
      referenceNumber: pay.reference_number || '',
      notes: pay.notes || ''
    });
    setEditingPaymentId(pay.id);
    setShowPaymentModal(true);
  };

  const savePayment = async () => {
    if (!currentPayment.amount || parseFloat(currentPayment.amount) <= 0) {
      showToast('Please specify a positive payment amount', 'warning');
      return;
    }

    try {
      const url = editingPaymentId ? `/api/payments/${editingPaymentId}` : '/api/payments';
      const method = editingPaymentId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPayment)
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error saving payment: ' + data.error, 'error');
        return;
      }

      setShowPaymentModal(false);
      await fetchInvoices();
      await fetchNotifications();
      showToast(editingPaymentId ? 'Payment updated' : 'Payment registered successfully', 'success');

      if (selectedInvoiceId) {
        viewInvoiceDetail(selectedInvoiceId);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save payment', 'error');
    }
  };

  const deletePayment = async (payId) => {
    triggerConfirm(
      'Delete Payment',
      'Are you sure you want to delete this payment transaction?',
      async () => {
        try {
          const res = await fetch(`/api/payments/${payId}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.error) {
            showToast('Error deleting payment: ' + data.error, 'error');
            return;
          }
          await fetchInvoices();
          await fetchNotifications();
          showToast('Payment transaction deleted', 'success');
          if (selectedInvoiceId) {
            viewInvoiceDetail(selectedInvoiceId);
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to delete payment', 'error');
        }
      }
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // QUOTATION CRUDS
  // ═══════════════════════════════════════════════════════════════════
  const updateQuotationItem = (index, field, value) => {
    const items = [...currentQuotation.items];
    items[index][field] = field === 'qty' || field === 'rate' || field === 'sr' || field === 'cgstRate' || field === 'sgstRate' ? parseFloat(value) || 0 : value;
    if (field === 'qty' || field === 'rate') {
      items[index].total = (items[index].qty * items[index].rate);
    }
    const totals = calculateTotals(items, currentQuotation.taxType, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate, currentQuotation.discount, currentQuotation.transportCharges, true);
    setCurrentQuotation({ ...currentQuotation, items, ...totals });
  };

  const addQuotationItem = () => {
    const items = [...currentQuotation.items, { sr: currentQuotation.items.length + 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }];
    const totals = calculateTotals(items, currentQuotation.taxType, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate, currentQuotation.discount, currentQuotation.transportCharges, true);
    setCurrentQuotation({ ...currentQuotation, items, ...totals });
  };

  const removeQuotationItem = (index) => {
    const items = currentQuotation.items.filter((_, i) => i !== index);
    const totals = calculateTotals(items, currentQuotation.taxType, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate, currentQuotation.discount, currentQuotation.transportCharges, true);
    setCurrentQuotation({ ...currentQuotation, items, ...totals });
  };

  const closeQuotationModal = () => {
    setCurrentQuotation({
      quotationNo: '',
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientId: '',
      items: [{ sr: 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }],
      taxType: 'CGST_SGST',
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      subtotal: 0,
      discount: 0,
      transportCharges: 0,
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
        showToast('Error loading quotation: ' + data.error, 'error');
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
          uom: item.uom || 'Nos',
          qty: item.qty,
          rate: item.rate,
          total: item.total,
          cgstRate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
          sgstRate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9)
        })),
        taxType: data.taxType || data.tax_type || 'CGST_SGST',
        cgstRate: data.cgstRate || data.cgst_rate || 9,
        sgstRate: data.sgstRate || data.sgst_rate || 9,
        igstRate: data.igstRate || data.igst_rate || 18,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        transportCharges: data.transportCharges || data.transport_charges || 0,
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
      showToast('Failed to load quotation details', 'error');
    }
  };

  const saveQuotation = async () => {
    if (!currentQuotation.clientId) { showToast('Please select a client', 'warning'); return; }

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
        showToast('Error saving quotation: ' + data.error, 'error');
        return;
      }

      closeQuotationModal();
      await fetchQuotations();
      await fetchNotifications();
      showToast(editingQuotationId ? 'Quotation updated!' : 'Quotation created successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save quotation', 'error');
    }
  };

  const deleteQuotation = async (id) => {
    triggerConfirm(
      'Delete Quotation',
      'Are you sure you want to delete this quotation?',
      async () => {
        try {
          const res = await fetch(`/api/quotations?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.error) {
            showToast('Error deleting quotation: ' + data.error, 'error');
            return;
          }
          await fetchQuotations();
          await fetchNotifications();
          showToast('Quotation deleted', 'success');
        } catch (err) {
          console.error(err);
          showToast('Failed to delete quotation', 'error');
        }
      }
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // CLIENT CRUDS
  // ═══════════════════════════════════════════════════════════════════
  const [newClient, setNewClient] = useState({
    name: '', contact_person: '', mobile: '', email: '', address: '', city: '', state: '', pin: '', gstin: '', pan: ''
  });

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
      showToast('Please fill in all required fields marked with *', 'warning');
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
        showToast('Error saving client: ' + data.error, 'error');
        return;
      }

      closeClientModal();
      await fetchClients();
      showToast(editingClientId ? 'Client records updated!' : 'Client registered successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save client records', 'error');
    }
  };

  const deleteClient = async (id) => {
    triggerConfirm(
      'Delete Client',
      'Are you sure you want to delete this client?',
      async () => {
        try {
          const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.error) {
            showToast('Cannot delete client: ' + data.error, 'error');
            return;
          }
          await fetchClients();
          showToast('Client records deleted', 'success');
        } catch (err) {
          console.error(err);
          showToast('Failed to delete client records', 'error');
        }
      }
    );
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
        showToast('Error saving settings: ' + data.error, 'error');
        return;
      }
      setCompany(data);
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update company settings', 'error');
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // AUTH HANDLERS
  // ═══════════════════════════════════════════════════════════════════
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('ever_ready_auth', 'true');
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Server error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ever_ready_auth');
    setIsAuthenticated(false);
    setLoginUsername('');
    setLoginPassword('');
    setCurrentPage('dashboard');
  };

  // ═══════════════════════════════════════════════════════════════════
  // PURCHASE ORDER CRUDS
  // ═══════════════════════════════════════════════════════════════════
  const addPurchaseOrderItem = () => {
    setCurrentPurchaseOrder(prev => {
      const items = [...prev.items, { sr: prev.items.length + 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }];
      const totals = calculateTotals(items, prev.taxType, prev.cgstRate, prev.sgstRate, prev.igstRate, prev.discount, prev.transportCharges, true);
      return { ...prev, items, ...totals };
    });
  };

  const removePurchaseOrderItem = (index) => {
    setCurrentPurchaseOrder(prev => {
      const newItems = prev.items.filter((_, i) => i !== index).map((item, idx) => ({ ...item, sr: idx + 1 }));
      const totals = calculateTotals(newItems, prev.taxType, prev.cgstRate, prev.sgstRate, prev.igstRate, prev.discount, prev.transportCharges, true);
      return { ...prev, items: newItems, ...totals };
    });
  };

  const openAddPurchaseOrderModal = () => {
    setCurrentPurchaseOrder({
      poNo: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      poDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientId: '',
      vendor_or_client: 'CLIENT',
      items: [{ sr: 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }],
      taxType: 'CGST_SGST',
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      subtotal: 0,
      discount: 0,
      transportCharges: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      grossTotal: 0
    });
    setEditingPurchaseOrderId(null);
    setShowPurchaseOrderModal(true);
  };

  const openEditPurchaseOrderModal = (po) => {
    setCurrentPurchaseOrder({
      ...po,
      poNo: po.poNo || po.po_no || '',
      poDate: po.poDate || po.po_date || new Date().toISOString().split('T')[0],
      validUntil: po.validUntil || po.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientId: po.clientId || po.client_id || '',
      vendor_or_client: po.vendor_or_client || 'CLIENT',
      taxType: po.taxType || po.tax_type || 'CGST_SGST',
      cgstRate: po.cgstRate ?? po.cgst_rate ?? 9,
      sgstRate: po.sgstRate ?? po.sgst_rate ?? 9,
      igstRate: po.igstRate ?? po.igst_rate ?? 18,
      subtotal: po.subtotal ?? 0,
      discount: po.discount ?? 0,
      transportCharges: po.transportCharges ?? po.transport_charges ?? 0,
      cgstAmount: po.cgstAmount ?? po.cgst_amount ?? 0,
      sgstAmount: po.sgstAmount ?? po.sgst_amount ?? 0,
      igstAmount: po.igstAmount ?? po.igst_amount ?? 0,
      grossTotal: po.grossTotal ?? po.gross_total ?? 0,
      items: po.items && po.items.length > 0 ? po.items.map(item => ({
        ...item,
        desc: item.desc || item.description || '',
        uom: item.uom || 'Nos',
        cgstRate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
        sgstRate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9)
      })) : [{ sr: 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }]
    });
    setEditingPurchaseOrderId(po.id);
    setShowPurchaseOrderModal(true);
  };

  const closePurchaseOrderModal = () => {
    setShowPurchaseOrderModal(false);
    setEditingPurchaseOrderId(null);
  };

  const savePurchaseOrder = async () => {
    if (!currentPurchaseOrder.clientId || !currentPurchaseOrder.poNo) {
      showToast('Please select a client/vendor and specify PO No', 'warning');
      return;
    }
    const hasEmptyItems = currentPurchaseOrder.items.some(i => !i.desc || i.qty <= 0 || i.rate <= 0);
    if (hasEmptyItems) {
      showToast('Please complete all item descriptions and values', 'warning');
      return;
    }

    try {
      const url = editingPurchaseOrderId ? `/api/purchase-orders?id=${editingPurchaseOrderId}` : '/api/purchase-orders';
      const method = editingPurchaseOrderId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPurchaseOrder)
      });
      const data = await res.json();

      if (data.error) {
        showToast('Error saving purchase order: ' + data.error, 'error');
        return;
      }

      closePurchaseOrderModal();
      await fetchPurchaseOrders();
      await fetchNotifications();
      showToast(editingPurchaseOrderId ? 'Purchase Order updated!' : 'Purchase Order created!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save purchase order', 'error');
    }
  };

  const deletePurchaseOrder = async (id) => {
    triggerConfirm(
      'Delete Purchase Order',
      'Are you sure you want to delete this purchase order?',
      async () => {
        try {
          const res = await fetch(`/api/purchase-orders?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.error) {
            showToast('Error deleting purchase order: ' + data.error, 'error');
            return;
          }
          await fetchPurchaseOrders();
          await fetchNotifications();
          showToast('Purchase Order deleted', 'success');
        } catch (err) {
          console.error(err);
          showToast('Failed to delete purchase order', 'error');
        }
      }
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // UPLOAD PO HANDLERS
  // ═══════════════════════════════════════════════════════════════════
  const saveUploadedPO = async () => {
    if (!currentUploadedPO.clientId || !currentUploadedPO.fileData) {
      showToast('Please select a client/vendor and upload a file', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/uploaded-pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentUploadedPO,
          upload_date: new Date().toISOString()
        })
      });
      const data = await res.json();

      if (data.error) {
        showToast('Error saving uploaded PO: ' + data.error, 'error');
        return;
      }

      setShowUploadPOModal(false);
      setCurrentUploadedPO({
        clientId: '',
        vendor_or_client: 'CLIENT',
        fileName: '',
        fileType: '',
        fileData: '',
        notes: ''
      });
      await fetchUploadedPOs();
      showToast('PO Uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload PO', 'error');
    }
  };

  const deleteUploadedPO = async (id) => {
    triggerConfirm(
      'Delete Uploaded PO',
      'Are you sure you want to delete this uploaded PO?',
      async () => {
        try {
          const res = await fetch(`/api/uploaded-pos?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.error) {
            showToast('Error deleting uploaded PO: ' + data.error, 'error');
            return;
          }
          await fetchUploadedPOs();
          showToast('Uploaded PO deleted', 'success');
        } catch (err) {
          console.error(err);
          showToast('Failed to delete uploaded PO', 'error');
        }
      }
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICATION HANDLERS
  // ═══════════════════════════════════════════════════════════════════
  const markNotificationAsRead = async (id) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
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
  // WHATSAPP REMINDER TEXTS
  // ═══════════════════════════════════════════════════════════════════
  const [reminderTemplate, setReminderTemplate] = useState('pending'); // pending, partial, overdue, created
  const [reminderInvoice, setReminderInvoice] = useState(null);

  const getReminderText = () => {
    if (!reminderInvoice) return '';
    const invNo = reminderInvoice.invoiceNo || reminderInvoice.invoice_no;
    const grossTotal = formatCurrency(reminderInvoice.grossTotal || reminderInvoice.gross_total);
    const outstanding = formatCurrency(reminderInvoice.remaining_amount);

    if (reminderTemplate === 'created') {
      return `Dear customer, Invoice ${invNo} of amount ${grossTotal} has been generated by ${company.name}. You can review the invoice details on your statement. Thank you.`;
    }
    if (reminderTemplate === 'pending') {
      return `Dear customer, Payment of ${grossTotal} for Invoice ${invNo} is pending. Please initiate the transfer to avoid service interruptions. Thank you, ${company.name}.`;
    }
    if (reminderTemplate === 'partial') {
      return `Dear customer, A partial balance of ${outstanding} remains for Invoice ${invNo}. Please clear the outstanding dues. Thank you, ${company.name}.`;
    }
    if (reminderTemplate === 'overdue') {
      return `URGENT: Dear customer, Invoice ${invNo} has passed its payment due date. Dues of ${outstanding} are critically overdue. Please initiate the payment immediately. ${company.name}.`;
    }
    if (reminderTemplate === 'acknowledgement') {
      return `Dear customer, We have successfully received and recorded a payment of ${formatCurrency(reminderInvoice.total_paid)} towards Invoice ${invNo}. The remaining outstanding dues are ${outstanding}. Thank you for your payment, ${company.name}.`;
    }
    return '';
  };

  const sendWhatsAppReminder = () => {
    const text = encodeURIComponent(getReminderText());
    const phone = reminderInvoice.clientMobile || '';
    const formattedPhone = phone.startsWith('91') ? phone : '91' + phone;
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
    setShowReminderModal(false);
    showToast('WhatsApp reminder window triggered', 'info');
  };

  // ═══════════════════════════════════════════════════════════════════
  // DOCUMENT PREVIEW COMPONENT (INLINE PREVIEWS FOR CUSTOM DIALOGS)
  // ═══════════════════════════════════════════════════════════════════
  const DocumentPreview = ({ type, data }) => {
    const selectedClient = clients.find(c => c.id == data.clientId || c.id == data.client_id);
    let docTitle = 'INVOICE';
    if (type === 'quotation') docTitle = 'QUOTATION';
    if (type === 'purchase_order') docTitle = 'PURCHASE ORDER';

    let docNumber = data.invoiceNo || data.invoice_no;
    if (type === 'quotation') docNumber = data.quotationNo || data.quotation_no;
    if (type === 'purchase_order') docNumber = data.poNo || data.po_no;

    let docDate = data.invoiceDate || data.invoice_date;
    if (type === 'quotation') docDate = data.quotationDate || data.quotation_date;
    if (type === 'purchase_order') docDate = data.poDate || data.po_date;

    const validUntilRow = (type === 'quotation' || type === 'purchase_order') ? (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '11px' }}>
        <span><strong>Valid Until:</strong></span>
        <span>{data.validUntil || data.valid_until}</span>
      </div>
    ) : null;

    let totalPaid = 0;
    let remaining = data.grossTotal || data.gross_total || 0;

    if (type === 'invoice') {
      if (data.recordPayment) {
        const addedPayment = parseFloat(data.paymentAmount !== undefined && data.paymentAmount !== '' ? data.paymentAmount : (data.grossTotal || data.gross_total || 0)) || 0;
        totalPaid = (data.total_paid || 0) + addedPayment;
        remaining = (data.grossTotal || data.gross_total || 0) - totalPaid;
      } else {
        totalPaid = data.total_paid || 0;
        remaining = (data.grossTotal || data.gross_total || 0) - totalPaid;
      }
    }

    return (
      <div className="print-document" style={{ background: 'white', color: '#1B2A4A', padding: '16px 40px 40px 40px', borderRadius: '8px', fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.6' }}>
        {/* Header */}
        <div style={{ border: '1px solid #ddd', padding: '10px 16px', marginBottom: '12px', display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', alignItems: 'center' }}>
          <div>
            <Logo width={90} height={60} theme="light" />
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 2px 0', color: '#1B2A4A' }}>{company.name}</h1>
            <p style={{ fontSize: '10px', margin: '2px 0', color: '#555' }}>{company.address}</p>
            <p style={{ fontSize: '10px', margin: '2px 0', color: '#555' }}>Mob-{company.phone} , Email -{company.email}</p>
            <p style={{ fontSize: '10.5px', margin: '2px 0', fontWeight: 'bold', color: '#1B2A4A' }}>GST NO-{company.gstin}</p>
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '-4px' }}>
            <hr style={{ margin: '4px 0', borderTop: '1px solid #ccc' }} />
            <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', margin: '0' }}>{docTitle}</p>
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
            <p><strong>{type === 'invoice' ? 'Invoice' : type === 'quotation' ? 'Quotation' : 'PO'} Date:</strong> {docDate}</p>
            <p><strong>{type === 'invoice' ? 'Invoice' : type === 'quotation' ? 'Quotation' : 'PO'} No.:</strong> {docNumber}</p>
            {type === 'invoice' && (
              <>
                <p><strong>PO No.:</strong> {data.poNo || data.po_no || '—'}</p>
                <p><strong>PO Date:</strong> {data.poDate || data.po_date || '—'}</p>
              </>
            )}
            {validUntilRow}
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0', border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ background: '#1B2A4A', color: 'white' }}>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'left', fontSize: '10px', width: '40px' }}>Sr. No</th>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'left', fontSize: '10px' }}>Material Description</th>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'left', fontSize: '10px', width: '80px' }}>HSN code</th>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'left', fontSize: '10px', width: '65px' }}>UOM</th>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'center', fontSize: '10px', width: '50px' }}>Qty</th>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'right', fontSize: '10px', width: '70px' }}>Rate</th>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'center', fontSize: '10px', width: '55px' }}>CGST</th>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'center', fontSize: '10px', width: '55px' }}>SGST</th>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'right', fontSize: '10px', width: '75px' }}>Tax Amt</th>
              <th style={{ border: '1px solid #333', padding: '6px', textAlign: 'right', fontSize: '10px', width: '90px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.map((item, i) => {
              const cgst = item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9);
              const sgst = item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9);
              const taxAmt = getItemTaxAmount(item, data.taxType || data.tax_type || 'CGST_SGST', data.discount || 0, data.items, data.igstRate || 18);
              return (
                <tr key={i}>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px' }}>{item.sr}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px' }}>{item.desc || item.description}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px' }}>{item.hsn || '—'}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px' }}>{item.uom || item.unitType || 'Nos'}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px', textAlign: 'right' }}>₹{(item.rate || 0).toFixed(2)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px', textAlign: 'center' }}>{cgst}%</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px', textAlign: 'center' }}>{sgst}%</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px', textAlign: 'right' }}>₹{taxAmt.toFixed(2)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', fontSize: '11px', textAlign: 'right' }}>₹{(item.total || 0).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
          <div>
            <p><strong>Amount In Word -</strong></p>
            <p style={{ fontStyle: 'italic' }}>{numberToWords(data.grossTotal || data.gross_total || 0)}</p>
          </div>
          <div style={{ fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
              <span>Total</span><span>₹{(data.subtotal || 0).toFixed(2)}</span>
            </div>
            {(data.discount || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd', color: '#c0392b' }}>
                <span>Discount</span><span>- ₹{(data.discount || 0).toFixed(2)}</span>
              </div>
            )}
            {(data.discount || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                <span>Taxable Amount</span><span>₹{(Math.max(0, (data.subtotal || 0) - (data.discount || 0))).toFixed(2)}</span>
              </div>
            )}
            {((data.cgstAmount || 0) + (data.sgstAmount || 0) + (data.igstAmount || 0)) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                <span>Total Tax Amount</span><span>₹{((data.cgstAmount || 0) + (data.sgstAmount || 0) + (data.igstAmount || 0)).toFixed(2)}</span>
              </div>
            )}
            {(data.transportCharges || data.transport_charges || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                <span>Transport Charges</span><span>₹{(data.transportCharges || data.transport_charges || 0).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 'bold', fontSize: '16px', borderTop: '2px solid #1B2A4A', marginTop: '4px' }}>
              <span>Gross Total</span><span>₹{(data.grossTotal || data.gross_total || 0).toFixed(2)}</span>
            </div>
            {type === 'invoice' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd', fontSize: '11px', color: '#555' }}>
                  <span>Amount Received</span><span>₹{totalPaid.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 'bold', fontSize: '13px', color: remaining > 0 ? '#e74c3c' : '#27ae60' }}>
                  <span>Pending Amount</span><span>₹{remaining.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Details Section */}
        <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #ddd', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          {/* Left Column: Bank Details & Receiver Sign */}
          <div>
            <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
              <p><strong>Account holder -</strong> {company.accountName}</p>
              <p>Account Number - {company.accountNo}</p>
              <p>IFSC Code - {company.ifscCode}</p>
              <p>Bank - {company.bankName}</p>
              <p>Branch - {company.bankBranch}</p>
            </div>
            <div style={{ marginTop: '20px', fontSize: '10px' }}>
              <p style={{ marginBottom: '40px' }}>Receiver Sign:</p>
              <p>_____________________</p>
            </div>
          </div>

          {/* Right Column: Authorized Signatory Stamp */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', fontSize: '10.5px', textAlign: 'center', alignSelf: 'end' }}>
            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>For {company.name}</p>
            <div style={{ marginBottom: '8px' }}>
              <CompanyStamp />
            </div>
            <p style={{ fontWeight: 'bold' }}>Authorised Signatory</p>
          </div>
        </div>
      </div>
    );
  };

  // Helper formatting currencies
  const formatCurrency = (val) => {
    return '₹' + (val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ═══════════════════════════════════════════════════════════════════
  // ADVANCED FILTERING LOGIC
  // ═══════════════════════════════════════════════════════════════════
  const filteredInvoices = invoices.filter(inv => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (inv.invoice_no || '').toLowerCase().includes(searchLower) ||
      (inv.clientName || '').toLowerCase().includes(searchLower) ||
      (inv.po_no || '').toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // 2. Filters
    if (filterClient && inv.client_id != filterClient) return false;
    if (filterStatus && inv.payment_status !== filterStatus) return false;
    if (filterGstType && inv.tax_type !== filterGstType) return false;

    if (filterStartDate && new Date(inv.invoice_date) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(inv.invoice_date) > new Date(filterEndDate)) return false;

    if (filterMinAmount && inv.gross_total < parseFloat(filterMinAmount)) return false;
    if (filterMaxAmount && inv.gross_total > parseFloat(filterMaxAmount)) return false;

    return true;
  });

  const filteredQuotations = quotations.filter(quot => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (quot.quotation_no || '').toLowerCase().includes(searchLower) ||
      (quot.clientName || '').toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (filterClient && quot.client_id != filterClient) return false;
    return true;
  });

  // Navigation Items Sidebar
  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'invoices', label: '🧾 Invoices' },
    { id: 'quotations', label: '📋 Quotations' },
    { id: 'purchase-orders', label: '📦 Purchase Orders' },
    { id: 'clients', label: '🏢 Clients' },
    { id: 'ledger', label: '🏛️ Ledger Statement' },
    { id: 'reports', label: '📊 Reports & GST' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#111d33', color: 'white', fontFamily: "'Exo 2', sans-serif", alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#152035', padding: '40px', borderRadius: '12px', border: '1px solid rgba(240,165,0,.18)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Logo width={180} height={120} theme="dark" />
          <h2 style={{ margin: '20px 0', fontSize: '24px', fontWeight: 'bold' }}>System Login</h2>
          {loginError && <div style={{ background: '#c0392b', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>{loginError}</div>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={e => setLoginUsername(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(240,165,0,.3)', background: '#111d33', color: 'white' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(240,165,0,.3)', background: '#111d33', color: 'white' }}
            />
            <button type="submit" style={{ background: '#F0A500', color: '#111d33', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111d33', color: 'white', fontFamily: "'Exo 2', sans-serif" }}>

      {/* TOAST SYSTEM */}
      <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: toast.type === 'error' ? '#c0392b' : toast.type === 'warning' ? '#d35400' : toast.type === 'info' ? '#2980b9' : '#27ae60',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '13px',
            fontWeight: '600',
            animation: 'slideIn 0.3s ease'
          }}>
            {toast.message}
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <aside className="no-print" style={{ width: '250px', background: 'linear-gradient(180deg, #0e1829 0%, #152035 100%)', borderRight: '1px solid rgba(240,165,0,.18)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', height: '100vh', overflowY: 'auto', zIndex: 100 }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Logo width={140} height={92} theme="dark" />
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                // reset selections
                setDetailedInvoice(null);
                setSelectedInvoiceId(null);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                background: currentPage === item.id || (item.id === 'invoices' && currentPage === 'invoice-detail') ? '#F0A500' : 'transparent',
                color: currentPage === item.id || (item.id === 'invoices' && currentPage === 'invoice-detail') ? '#111d33' : '#8a96b0',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid rgba(240,165,0,.18)', paddingTop: '16px', fontSize: '11px', textAlign: 'center' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '10px', background: 'transparent', border: '1px solid #c0392b', color: '#e74c3c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '16px', transition: 'all 0.2s'
            }}
          >
            Logout
          </button>
          <p style={{ fontWeight: 'bold', color: '#F0A500' }}>{company.name}</p>
          <p style={{ color: '#8a96b0', margin: '4px 0' }}>GSTIN: {company.gstin}</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: '250px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* TOPBAR */}
        <header className="no-print" style={{ height: '70px', background: 'linear-gradient(90deg, #111d33 0%, #152035 100%)', borderBottom: '1px solid rgba(240,165,0,.18)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '20px', position: 'sticky', top: 0, zIndex: 90 }}>
          <h1 style={{ flex: 1, fontSize: '24px', fontWeight: '700', letterSpacing: '1px' }}>
            {currentPage === 'dashboard' && '📊 Dashboard Analytics'}
            {currentPage === 'invoices' && '🧾 Invoices Tracking'}
            {currentPage === 'invoice-detail' && `🧾 Invoice ${detailedInvoice?.invoice_no || ''}`}
            {currentPage === 'quotations' && '📋 Quotations Estimate'}
            {currentPage === 'purchase-orders' && '📦 Purchase Orders'}
            {currentPage === 'upload-po' && '📤 Upload PO'}
            {currentPage === 'clients' && '🏢 Client Registry'}
            {currentPage === 'ledger' && '🏛️ Client Statement Ledger'}
            {currentPage === 'reports' && '📊 Reports & GST Breakdowns'}
            {currentPage === 'settings' && '⚙️ Profile Settings'}
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
              onClick={() => {
                setCurrentInvoice({
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
                  grossTotal: 0,
                  recordPayment: false,
                  paymentDate: new Date().toISOString().split('T')[0],
                  paymentAmount: '',
                  paymentMode: 'UPI',
                  paymentRef: ''
                }); setShowInvoiceModal(true);
              }}
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
              onClick={() => {
                setCurrentQuotation({
                  quotationNo: `QUO-${quotations.length + 101}`,
                  quotationDate: new Date().toISOString().split('T')[0],
                  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  clientId: '',
                  items: [{ sr: 1, desc: '', hsn: '', uom: 'Nos', qty: 1, rate: 0, total: 0, cgstRate: 9, sgstRate: 9 }],
                  taxType: 'CGST_SGST',
                  cgstRate: 9,
                  sgstRate: 9,
                  igstRate: 18,
                  subtotal: 0,
                  cgstAmount: 0,
                  sgstAmount: 0,
                  igstAmount: 0,
                  grossTotal: 0
                }); setShowQuotationModal(true);
              }}
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
              {/* Analytics Summary Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Sales Revenue', value: formatCurrency(dashboardStats.totalRevenue), bg: '#192338', border: 'rgba(240,165,0,.18)' },
                  { label: 'Outstanding Balance', value: formatCurrency(dashboardStats.totalOutstanding), color: '#e74c3c', bg: '#192338', border: 'rgba(231,76,60,.25)' },
                  { label: 'This Month Collections', value: formatCurrency(dashboardStats.thisMonthCollections), color: '#27ae60', bg: '#192338', border: 'rgba(39,174,96,.25)' },
                  { label: 'Overdue Amount (>30d)', value: formatCurrency(dashboardStats.overdueAmount), color: '#d35400', bg: '#192338', border: 'rgba(211,84,0,.25)' }
                ].map((stat, i) => (
                  <div key={i} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: '12px', padding: '24px' }}>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8a96b0', marginBottom: '10px' }}>{stat.label}</h3>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: stat.color || '#F0A500' }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Counts metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '32px' }}>
                {[
                  { label: 'Fully Paid Invoices', val: dashboardStats.paidCount, col: '#27ae60' },
                  { label: 'Partially Paid Invoices', val: dashboardStats.partialCount, col: '#f39c12' },
                  { label: 'Unpaid Invoices', val: dashboardStats.unpaidCount, col: '#c0392b' },
                  { label: 'Active Registered Clients', val: dashboardStats.totalClients, col: '#3498db' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#152035', padding: '16px 20px', borderRadius: '8px', borderLeft: `4px solid ${item.col}` }}>
                    <span style={{ fontSize: '11px', color: '#8a96b0', display: 'block' }}>{item.label}</span>
                    <span style={{ fontSize: '20px', bold: true, color: 'white', display: 'block', marginTop: '4px' }}>{item.val}</span>
                  </div>
                ))}
              </div>

              {/* Grid Logs / Layout lists */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>

                {/* Recent Payments Transaction Log */}
                <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>💸 Recent Cash Collections</h2>
                    <Landmark size={20} style={{ color: '#F0A500' }} />
                  </div>
                  {dashboardStats.recentPayments.length === 0 ? (
                    <p style={{ color: '#8a96b0', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>No transactions recorded yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {dashboardStats.recentPayments.map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#0e1829', borderRadius: '8px', borderLeft: '3px solid #27ae60' }}>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '13px' }}>Invoice {p.invoice_no}</p>
                            <p style={{ fontSize: '11px', color: '#8a96b0', marginTop: '3px' }}>Date: {p.payment_date} | Mode: {p.payment_mode}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: '700', color: '#27ae60', fontSize: '13px' }}>+{formatCurrency(p.amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Overdue/Client listings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* High Value Clients */}
                  <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500', marginBottom: '14px' }}>🏆 Top Billing Accounts</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dashboardStats.highValueClients.map((c, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0e1829', borderRadius: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>{c.name}</span>
                          <span style={{ fontSize: '12px', color: '#F0A500', fontWeight: '700' }}>{formatCurrency(c.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overdue alert panel */}
                  <div style={{ background: '#192338', border: '1px solid rgba(231,76,60,.25)', borderRadius: '12px', padding: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#e74c3c', marginBottom: '14px' }}>⚠️ Dues Overdue Alert</h2>
                    {dashboardStats.overdueInvoicesList.length === 0 ? (
                      <p style={{ color: '#8a96b0', fontSize: '12px' }}>No overdue accounts as of today.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {dashboardStats.overdueInvoicesList.map((inv, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#eee' }}>
                            <span>{inv.invoice_no} ({inv.clientName})</span>
                            <span style={{ color: '#e74c3c', fontWeight: '700' }}>{formatCurrency(inv.remaining_amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* INVOICES LIST VIEW */}
          {currentPage === 'invoices' && (
            <div>
              {/* Toolbar search & filters */}
              <div style={{ background: '#192338', padding: '16px', borderRadius: '10px', marginBottom: '24px', border: '1px solid rgba(240,165,0,.15)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#8a96b0' }} />
                    <input
                      type="text"
                      placeholder="Search Invoice number, Client name, PO number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 36px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                    />
                  </div>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    style={{ padding: '10px 16px', background: showAdvancedFilters ? '#F0A500' : 'rgba(240,165,0,.1)', color: showAdvancedFilters ? '#111d33' : '#F0A500', border: '1px solid rgba(240,165,0,.3)', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Filter size={16} /> Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    style={{ padding: '10px 16px', background: 'transparent', color: '#8a96b0', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                </div>

                {/* ADVANCED FILTER DRAWER */}
                {showAdvancedFilters && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px', borderTop: '1px solid rgba(240,165,0,.15)', paddingTop: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Client Accounts</label>
                      <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '6px', color: 'white', fontSize: '12px' }}>
                        <option value="">All Clients</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Payment Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '6px', color: 'white', fontSize: '12px' }}>
                        <option value="">All Statuses</option>
                        <option value="UNPAID">UNPAID</option>
                        <option value="PARTIAL">PARTIAL</option>
                        <option value="PAID">PAID</option>
                        <option value="OVERPAID">OVERPAID</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Date Range From</label>
                      <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '6px', color: 'white', fontSize: '12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Date Range To</label>
                      <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '6px', color: 'white', fontSize: '12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Min Amount (₹)</label>
                      <input type="number" placeholder="0" value={filterMinAmount} onChange={(e) => setFilterMinAmount(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '6px', color: 'white', fontSize: '12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Max Amount (₹)</label>
                      <input type="number" placeholder="500,000" value={filterMaxAmount} onChange={(e) => setFilterMaxAmount(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '6px', color: 'white', fontSize: '12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>GST Type</label>
                      <select value={filterGstType} onChange={(e) => setFilterGstType(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '6px', color: 'white', fontSize: '12px' }}>
                        <option value="">All Taxes</option>
                        <option value="CGST_SGST">CGST + SGST</option>
                        <option value="IGST">IGST</option>
                        <option value="NONE">No Tax</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {filteredInvoices.length === 0 ? (
                <div style={{ background: '#192338', border: '2px dashed rgba(240,165,0,.3)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', color: '#8a96b0' }}>📄 No invoices match the criteria</p>
                  <p style={{ color: '#8a96b0', marginTop: '8px' }}>Refine search queries or click "New Invoice" to create one</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', background: '#192338', border: '1px solid rgba(240,165,0,.15)', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                    <thead>
                      <tr style={{ background: '#152035', borderBottom: '1px solid rgba(240,165,0,.15)' }}>
                        <th style={{ padding: '16px', fontSize: '12px', color: '#F0A500', fontWeight: 'bold' }}>Invoice Details</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: '#F0A500', fontWeight: 'bold' }}>Client Name</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: '#F0A500', fontWeight: 'bold', textAlign: 'right' }}>Grand Total</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: '#F0A500', fontWeight: 'bold', textAlign: 'right' }}>Total Paid</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: '#F0A500', fontWeight: 'bold', textAlign: 'right' }}>Outstanding</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: '#F0A500', fontWeight: 'bold', textAlign: 'center', width: '120px' }}>PO File</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: '#F0A500', fontWeight: 'bold', textAlign: 'center', width: '110px' }}>Status</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: '#F0A500', fontWeight: 'bold', textAlign: 'center', width: '180px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid rgba(240,165,0,.1)', transition: 'background 0.2s', ':hover': { background: '#222' } }}>
                          <td style={{ padding: '14px 16px' }}>
                            <span onClick={() => viewInvoiceDetail(inv.id)} style={{ fontSize: '14px', fontWeight: '700', color: '#F0A500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {inv.invoice_no} <ChevronRight size={14} />
                            </span>
                            <span style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginTop: '3px' }}>Date: {inv.invoice_date}</span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#eee' }}>{inv.clientName}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(inv.gross_total)}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#27ae60', fontWeight: '600', textAlign: 'right' }}>{formatCurrency(inv.total_paid)}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: inv.remaining_amount > 0 ? '#e74c3c' : '#8a96b0', fontWeight: '600', textAlign: 'right' }}>{formatCurrency(inv.remaining_amount)}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            {inv.po_file_name ? (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const byteCharacters = atob(inv.po_file_data);
                                    const byteNumbers = new Array(byteCharacters.length);
                                    for (let i = 0; i < byteCharacters.length; i++) {
                                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(byteNumbers);
                                    const blob = new Blob([byteArray], { type: inv.po_file_type });
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                  }}
                                  style={{ padding: '6px 8px', background: 'rgba(39,174,96,.15)', border: 'none', borderRadius: '4px', color: '#27ae60', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold' }}
                                  title={inv.po_file_name}
                                >
                                  <Eye size={12} /> View
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteInvoicePO(inv.id);
                                  }}
                                  style={{ padding: '6px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                                  title="Delete PO File"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerPOUpload(inv.id);
                                }}
                                style={{ padding: '6px 8px', background: 'rgba(240,165,0,.15)', border: 'none', borderRadius: '4px', color: '#F0A500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold' }}
                              >
                                <Upload size={12} /> Upload
                              </button>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              fontSize: '10px',
                              fontWeight: '700',
                              borderRadius: '4px',
                              background: inv.payment_status === 'PAID' ? 'rgba(39,174,96,.15)' : inv.payment_status === 'PARTIAL' ? 'rgba(243,156,18,.15)' : inv.payment_status === 'OVERPAID' ? 'rgba(142,68,173,.15)' : 'rgba(192,57,43,.15)',
                              color: inv.payment_status === 'PAID' ? '#27ae60' : inv.payment_status === 'PARTIAL' ? '#f39c12' : inv.payment_status === 'OVERPAID' ? '#8e44ad' : '#c0392b'
                            }}>
                              {inv.payment_status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={(e) => { e.stopPropagation(); viewInvoiceDetail(inv.id); }} style={{ padding: '6px 10px', background: 'rgba(240,165,0,.15)', border: 'none', borderRadius: '4px', color: '#F0A500', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Manage</button>
                              {inv.remaining_amount > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); openAddPaymentModal(inv); }} style={{ padding: '6px 10px', background: '#27ae60', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>+ Collect</button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReminderInvoice(inv);
                                  const isPaid = inv.payment_status === 'PAID' || inv.remaining_amount <= 0;
                                  setReminderTemplate(isPaid ? 'created' : (inv.remaining_amount === inv.gross_total ? 'pending' : 'partial'));
                                  setShowReminderModal(true);
                                }}
                                style={{ padding: '6px 8px', background: 'rgba(52,152,219,.15)', border: 'none', borderRadius: '4px', color: '#3498db', cursor: 'pointer' }}
                              >
                                <Share2 size={13} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); editInvoice(inv); }} style={{ padding: '6px', background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}><Edit2 size={14} /></button>
                              <button onClick={(e) => { e.stopPropagation(); deleteInvoice(inv.id); }} style={{ padding: '6px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* INVOICE DETAIL & TIMELINE VIEW */}
          {currentPage === 'invoice-detail' && detailedInvoice && (
            <div>
              {/* Back navigation header */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
                <button
                  onClick={() => { setCurrentPage('invoices'); setDetailedInvoice(null); }}
                  style={{ padding: '8px 16px', background: 'rgba(240,165,0,.1)', color: '#F0A500', border: '1px solid rgba(240,165,0,.3)', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  ← Back to Invoices
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => exportInvoicePDF({ invoice: detailedInvoice, companySettings: company })} style={{ padding: '8px 14px', background: 'rgba(39,174,96,.15)', border: 'none', borderRadius: '6px', color: '#27ae60', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={14} /> Export PDF
                  </button>
                  <button onClick={() => {
                    setReminderInvoice(detailedInvoice);
                    const isPaid = detailedInvoice.payment_status === 'PAID' || detailedInvoice.remaining_amount <= 0;
                    setReminderTemplate(isPaid ? 'created' : (detailedInvoice.remaining_amount === detailedInvoice.gross_total ? 'pending' : 'partial'));
                    setShowReminderModal(true);
                  }} style={{ padding: '8px 14px', background: 'rgba(52,152,219,.15)', border: 'none', borderRadius: '6px', color: '#3498db', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Share2 size={14} /> Share Reminder
                  </button>
                  {detailedInvoice.remaining_amount > 0 && (
                    <button onClick={() => markFullyPaid(detailedInvoice)} style={{ padding: '8px 14px', background: '#27ae60', border: 'none', borderRadius: '6px', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                      Mark Fully Paid
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
                <div>
                  {/* Detailed summary card */}
                  <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.15)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ color: '#F0A500', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid rgba(240,165,0,.15)', paddingBottom: '8px' }}>🧾 Invoice Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                      <div><span style={{ fontSize: '11px', color: '#8a96b0' }}>INVOICE NO</span><p style={{ fontSize: '14px', fontWeight: '700' }}>{detailedInvoice.invoice_no}</p></div>
                      <div><span style={{ fontSize: '11px', color: '#8a96b0' }}>DATE</span><p style={{ fontSize: '14px', fontWeight: '700' }}>{detailedInvoice.invoice_date}</p></div>
                      <div><span style={{ fontSize: '11px', color: '#8a96b0' }}>CLIENT NAME</span><p style={{ fontSize: '14px', fontWeight: '700' }}>{detailedInvoice.clientName}</p></div>
                      <div><span style={{ fontSize: '11px', color: '#8a96b0' }}>PO NUMBER</span><p style={{ fontSize: '14px', fontWeight: '700' }}>{detailedInvoice.po_no || '—'}</p></div>
                      <div><span style={{ fontSize: '11px', color: '#8a96b0' }}>PO DATE</span><p style={{ fontSize: '14px', fontWeight: '700' }}>{detailedInvoice.po_date || '—'}</p></div>
                      <div><span style={{ fontSize: '11px', color: '#8a96b0' }}>TAX TYPE</span><p style={{ fontSize: '14px', fontWeight: '700' }}>{detailedInvoice.tax_type}</p></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', background: '#0e1829', padding: '16px', borderRadius: '8px' }}>
                      <div><span style={{ fontSize: '10px', color: '#8a96b0' }}>GRAND TOTAL</span><p style={{ fontSize: '18px', fontWeight: 'bold', color: '#F0A500' }}>{formatCurrency(detailedInvoice.gross_total)}</p></div>
                      <div><span style={{ fontSize: '10px', color: '#8a96b0' }}>TOTAL PAID</span><p style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{formatCurrency(detailedInvoice.total_paid)}</p></div>
                      <div><span style={{ fontSize: '10px', color: '#8a96b0' }}>OUTSTANDING</span><p style={{ fontSize: '18px', fontWeight: 'bold', color: '#e74c3c' }}>{formatCurrency(detailedInvoice.remaining_amount)}</p></div>
                    </div>
                  </div>

                  {/* Payment history block */}
                  <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.15)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ color: '#F0A500', fontSize: '16px', fontWeight: 'bold' }}>💸 Dues Collections Dockets</h3>
                      {detailedInvoice.remaining_amount > 0 && (
                        <button onClick={() => openAddPaymentModal(detailedInvoice)} style={{ padding: '8px 16px', background: '#27ae60', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Payment</button>
                      )}
                    </div>
                    {!detailedInvoice.payments || detailedInvoice.payments.length === 0 ? (
                      <p style={{ color: '#8a96b0', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>No transactions recorded for this invoice estimate.</p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ background: '#0e1829', color: '#8a96b0', borderBottom: '1px solid rgba(240,165,0,.1)' }}>
                              <th style={{ padding: '10px' }}>Date</th>
                              <th style={{ padding: '10px' }}>Mode</th>
                              <th style={{ padding: '10px' }}>Reference No</th>
                              <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                              <th style={{ padding: '10px', textAlign: 'center', width: '120px' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(detailedInvoice.payments || []).map((p, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(138,150,176,.15)' }}>
                                <td style={{ padding: '10px' }}>{p.payment_date}</td>
                                <td style={{ padding: '10px' }}>{p.payment_mode}</td>
                                <td style={{ padding: '10px', fontFamily: 'monospace' }}>{p.reference_number || '—'}</td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#27ae60' }}>{formatCurrency(p.amount)}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button onClick={() => exportReceiptPDF({ payment: p, invoice: detailedInvoice, companySettings: company })} style={{ padding: '4px', background: 'none', border: 'none', color: '#F0A500', cursor: 'pointer' }}><Download size={13} /></button>
                                    <button onClick={() => openEditPaymentModal(p)} style={{ padding: '4px', background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}><Edit2 size={13} /></button>
                                    <button onClick={() => deletePayment(p.id)} style={{ padding: '4px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}><Trash2 size={13} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* TIMELINE AUDIT FEED */}
                <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.15)', borderRadius: '12px', padding: '24px', maxHeight: '550px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#F0A500', fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>💬 Audit logs & Comments</h3>

                  {/* Message timeline area */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '16px' }}>
                    {detailedComments.length === 0 ? (
                      <p style={{ color: '#8a96b0', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>No timeline logs recorded.</p>
                    ) : (
                      detailedComments.map(c => (
                        <div key={c.id} style={{
                          background: c.comment_type === 'SYSTEM' ? 'rgba(240,165,0,.04)' : '#0e1829',
                          border: c.comment_type === 'SYSTEM' ? '1px dashed rgba(240,165,0,.15)' : '1px solid rgba(138,150,176,.15)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              background: c.comment_type === 'SYSTEM' ? 'rgba(240,165,0,.2)' : 'rgba(52,152,219,.2)',
                              color: c.comment_type === 'SYSTEM' ? '#F0A500' : '#3498db'
                            }}>
                              {c.comment_type}
                            </span>
                            <span style={{ fontSize: '9px', color: '#8a96b0' }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p style={{ fontSize: '11px', color: '#eee', margin: 0 }}>{c.comment}</p>
                          <span style={{ fontSize: '8.5px', color: '#8a96b0', display: 'block', marginTop: '3px', textAlign: 'right' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add note interface */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add system note..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}
                      style={{ flex: 1, padding: '8px 12px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                    />
                    <button onClick={addComment} style={{ padding: '8px 14px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Add</button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* QUOTATIONS PAGE */}
          {currentPage === 'quotations' && (
            <div>
              {/* Toolbar */}
              <div style={{ background: '#192338', padding: '16px', borderRadius: '10px', marginBottom: '24px', border: '1px solid rgba(240,165,0,.15)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#8a96b0' }} />
                    <input
                      type="text"
                      placeholder="Search Quotation estimates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 36px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              {filteredQuotations.length === 0 ? (
                <div style={{ background: '#192338', border: '2px dashed rgba(240,165,0,.3)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', color: '#8a96b0' }}>📋 No quotations yet</p>
                  <p style={{ color: '#8a96b0', marginTop: '8px' }}>Click "New Quotation" to create one</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {filteredQuotations.map(quot => (
                    <div key={quot.id} style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500' }}>{quot.quotation_no}</p>
                          <p style={{ fontSize: '12px', color: '#8a96b0', marginTop: '4px' }}>{quot.clientName}</p>
                          <p style={{ fontSize: '12px', color: '#8a96b0', marginTop: '4px' }}>Valid until: {quot.valid_until}</p>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            background: quot.status === 'ACCEPTED' ? 'rgba(39,174,96,.15)' : quot.status === 'DECLINED' ? 'rgba(192,57,43,.15)' : 'rgba(243,156,18,.15)',
                            color: quot.status === 'ACCEPTED' ? '#27ae60' : quot.status === 'DECLINED' ? '#c0392b' : '#f39c12',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700',
                            marginTop: '8px'
                          }}>
                            {quot.status}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500' }}>{formatCurrency(quot.gross_total)}</p>
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

          {/* PURCHASE ORDERS VIEW */}
          {currentPage === 'purchase-orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ position: 'relative', width: '400px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#8a96b0' }} />
                  <input
                    type="text"
                    placeholder="Search POs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 40px', background: '#192338', border: '1px solid rgba(240,165,0,.3)', borderRadius: '8px', color: 'white', fontSize: '14px' }}
                  />
                </div>
                <button
                  onClick={openAddPurchaseOrderModal}
                  style={{ background: '#F0A500', color: '#111d33', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <Plus size={18} /> New Purchase Order
                </button>
              </div>

              {purchaseOrders.length === 0 ? (
                <div style={{ background: '#192338', border: '2px dashed rgba(240,165,0,.3)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', color: '#8a96b0' }}>📦 No purchase orders yet</p>
                  <p style={{ color: '#8a96b0', marginTop: '8px' }}>Click "New Purchase Order" to create one</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {purchaseOrders.map(po => (
                    <div key={po.id} style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500' }}>{po.po_no}</p>
                          <p style={{ fontSize: '12px', color: '#8a96b0', marginTop: '4px' }}>{po.clientName}</p>
                          <p style={{ fontSize: '12px', color: '#8a96b0', marginTop: '4px' }}>Valid until: {po.valid_until}</p>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            background: 'rgba(243,156,18,.15)',
                            color: '#f39c12',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700',
                            marginTop: '8px'
                          }}>
                            {po.vendor_or_client}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500' }}>{formatCurrency(po.gross_total)}</p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/purchase-orders?id=${po.id}`);
                                  const data = await res.json();
                                  setPreviewType('purchase_order');
                                  setCurrentPurchaseOrder(data);
                                  setShowPreview(true);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              style={{ padding: '6px', background: 'none', border: 'none', color: '#F0A500', cursor: 'pointer' }}
                              title="Preview Document"
                            >
                              <Eye size={16} />
                            </button>

                            {/* File Attachment View/Upload/Delete */}
                            {po.file_name ? (
                              <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', background: 'rgba(39,174,96,.1)', padding: '2px 6px', borderRadius: '6px' }}>
                                <button
                                  onClick={() => {
                                    const byteCharacters = atob(po.file_data);
                                    const byteNumbers = new Array(byteCharacters.length);
                                    for (let i = 0; i < byteCharacters.length; i++) {
                                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(byteNumbers);
                                    const blob = new Blob([byteArray], { type: po.file_type });
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#27ae60', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold' }}
                                  title={po.file_name}
                                >
                                  <Upload size={12} /> View
                                </button>
                                <button
                                  onClick={() => deletePurchaseOrderFile(po.id)}
                                  style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '2px' }}
                                  title="Delete File"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => triggerFilePOUpload(po.id)}
                                style={{ padding: '4px 8px', background: 'rgba(240,165,0,.1)', border: 'none', borderRadius: '6px', color: '#F0A500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold' }}
                                title="Upload File"
                              >
                                <Upload size={12} /> Upload
                              </button>
                            )}

                            <button
                              onClick={() => openEditPurchaseOrderModal(po)}
                              style={{ padding: '6px', background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}
                              title="Edit PO"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deletePurchaseOrder(po.id)}
                              style={{ padding: '6px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                              title="Delete PO"
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

          {/* UPLOAD PO VIEW */}
          {currentPage === 'upload-po' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', color: '#F0A500' }}>Uploaded Purchase Orders</h2>
                <button
                  onClick={() => setShowUploadPOModal(true)}
                  style={{ background: '#F0A500', color: '#111d33', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <Plus size={18} /> Upload PO
                </button>
              </div>

              {uploadedPOs.length === 0 ? (
                <div style={{ background: '#192338', border: '2px dashed rgba(240,165,0,.3)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', color: '#8a96b0' }}>📤 No uploaded POs yet</p>
                  <p style={{ color: '#8a96b0', marginTop: '8px' }}>Click "Upload PO" to add one</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {uploadedPOs.map(po => (
                    <div key={po.id} style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <p style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }} title={po.file_name}>{po.file_name}</p>
                          <p style={{ fontSize: '12px', color: '#8a96b0', marginTop: '4px' }}>{po.clientName}</p>
                          <p style={{ fontSize: '11px', color: '#8a96b0', marginTop: '4px' }}>{new Date(po.upload_date).toLocaleDateString()}</p>
                          {po.notes && <p style={{ fontSize: '12px', color: '#ccc', marginTop: '8px', fontStyle: 'italic' }}>{po.notes}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                          <button
                            onClick={() => {
                              // Create a blob and open it
                              const byteCharacters = atob(po.file_data);
                              const byteNumbers = new Array(byteCharacters.length);
                              for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                              }
                              const byteArray = new Uint8Array(byteNumbers);
                              const blob = new Blob([byteArray], { type: po.file_type });
                              const url = URL.createObjectURL(blob);
                              window.open(url, '_blank');
                            }}
                            style={{ padding: '6px', background: 'none', border: 'none', color: '#F0A500', cursor: 'pointer' }}
                            title="View File"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => deleteUploadedPO(po.id)}
                            style={{ padding: '6px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                            title="Delete File"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CLIENTS REGISTRY VIEW */}
          {currentPage === 'clients' && (
            <div>
              {clients.length === 0 ? (
                <div style={{ background: '#192338', border: '2px dashed rgba(240,165,0,.3)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', color: '#8a96b0' }}>🏢 No clients yet</p>
                  <p style={{ color: '#8a96b0', marginTop: '8px' }}>Click "Add Client" to register one</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: selectedClientOverview ? '340px 1fr' : '1fr', gap: '20px', alignItems: 'start' }}>
                  {/* Client list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {clients.map(client => (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClientOverview(selectedClientOverview?.id === client.id ? null : client)}
                        style={{
                          background: selectedClientOverview?.id === client.id ? 'rgba(240,165,0,.12)' : '#192338',
                          border: selectedClientOverview?.id === client.id ? '1px solid rgba(240,165,0,.5)' : '1px solid rgba(240,165,0,.18)',
                          borderRadius: '12px', padding: '16px', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500' }}>{client.name}</h3>
                            <p style={{ fontSize: '11px', color: '#8a96b0', marginTop: '3px' }}>{client.city}, {client.pin}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setSelectedLedgerClientId(client.id); setCurrentPage('ledger'); }} title="Ledger" style={{ padding: '5px', background: 'none', border: 'none', color: '#F0A500', cursor: 'pointer' }}><FileText size={14} /></button>
                            <button onClick={() => editClient(client)} style={{ padding: '5px', background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}><Edit2 size={14} /></button>
                            <button onClick={() => deleteClient(client.id)} style={{ padding: '5px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#8a96b0', lineHeight: '1.7' }}>
                          <p>📞 {client.contact_person || '—'} ({client.mobile})</p>
                          {client.gstin && <p>🏦 {client.gstin}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Client document overview panel */}
                  {selectedClientOverview && (() => {
                    const cId = String(selectedClientOverview.id);

                    const filterByDate = (items, dateField) => items.filter(i => {
                      const d = i[dateField];
                      if (clientOverviewDateFrom && d < clientOverviewDateFrom) return false;
                      if (clientOverviewDateTo && d > clientOverviewDateTo) return false;
                      return true;
                    });

                    const cInvoices = filterByDate(invoices.filter(i => String(i.client_id || i.clientId) === cId), 'invoice_date');
                    const cQuotations = filterByDate(quotations.filter(q => String(q.client_id || q.clientId) === cId), 'quotation_date');
                    const cPOs = filterByDate(purchaseOrders.filter(p => String(p.client_id || p.clientId) === cId), 'po_date');
                    const cUploads = uploadedPOs.filter(u => String(u.client_id || u.clientId) === cId);

                    const tabs = [
                      { key: 'invoices', label: '🧾 Invoices', items: cInvoices, color: '#3498db' },
                      { key: 'quotations', label: '📋 Quotations', items: cQuotations, color: '#f39c12' },
                      { key: 'pos', label: '📦 POs', items: cPOs, color: '#27ae60' },
                      { key: 'uploads', label: '📤 Uploads', items: cUploads, color: '#9b59b6' },
                    ];

                    const activeTab = tabs.find(t => t.key === clientOverviewTab) || tabs[0];
                    const totalPages = Math.max(1, Math.ceil(activeTab.items.length / CLIENT_OVERVIEW_PAGE_SIZE));
                    const safePage = Math.min(clientOverviewPage, totalPages);
                    const pagedItems = activeTab.items.slice((safePage - 1) * CLIENT_OVERVIEW_PAGE_SIZE, safePage * CLIENT_OVERVIEW_PAGE_SIZE);

                    const handleTabChange = (key) => { setClientOverviewTab(key); setClientOverviewPage(1); };
                    const handleDateChange = () => setClientOverviewPage(1);

                    return (
                      <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.2)', borderRadius: '12px', padding: '20px', maxHeight: '85vh', overflowY: 'auto' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                          <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#F0A500' }}>{selectedClientOverview.name}</h2>
                            <p style={{ fontSize: '11px', color: '#8a96b0', marginTop: '3px' }}>{selectedClientOverview.address}, {selectedClientOverview.city}</p>
                            {selectedClientOverview.mobile && <p style={{ fontSize: '11px', color: '#8a96b0' }}>📞 {selectedClientOverview.mobile}</p>}
                          </div>
                          <button onClick={() => setSelectedClientOverview(null)} style={{ background: 'none', border: 'none', color: '#8a96b0', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                        </div>

                        {/* Stats bar */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                          {tabs.map(t => (
                            <div key={t.key} onClick={() => handleTabChange(t.key)} style={{ background: '#0e1829', borderRadius: '8px', padding: '10px', textAlign: 'center', cursor: 'pointer', border: clientOverviewTab === t.key ? `1px solid ${t.color}` : '1px solid transparent', transition: 'border 0.2s' }}>
                              <p style={{ fontSize: '20px', fontWeight: '700', color: t.color }}>{t.items.length}</p>
                              <p style={{ fontSize: '10px', color: '#8a96b0' }}>{t.label.split(' ').slice(1).join(' ')}</p>
                            </div>
                          ))}
                        </div>

                        {/* Date filter (hidden for uploads tab) */}
                        {clientOverviewTab !== 'uploads' && (
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#8a96b0', whiteSpace: 'nowrap' }}>📅 Filter:</span>
                            <input type="date" value={clientOverviewDateFrom} onChange={e => { setClientOverviewDateFrom(e.target.value); handleDateChange(); }}
                              style={{ flex: 1, padding: '6px 8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '6px', color: 'white', fontSize: '12px' }} />
                            <span style={{ color: '#8a96b0', fontSize: '11px' }}>to</span>
                            <input type="date" value={clientOverviewDateTo} onChange={e => { setClientOverviewDateTo(e.target.value); handleDateChange(); }}
                              style={{ flex: 1, padding: '6px 8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '6px', color: 'white', fontSize: '12px' }} />
                            {(clientOverviewDateFrom || clientOverviewDateTo) && (
                              <button onClick={() => { setClientOverviewDateFrom(''); setClientOverviewDateTo(''); setClientOverviewPage(1); }} style={{ padding: '6px 8px', background: 'rgba(231,76,60,.15)', border: '1px solid rgba(231,76,60,.3)', color: '#e74c3c', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Clear</button>
                            )}
                          </div>
                        )}

                        {/* Tab label */}
                        <div style={{ fontSize: '12px', fontWeight: '700', color: activeTab.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                          {activeTab.label} — {activeTab.items.length} record{activeTab.items.length !== 1 ? 's' : ''}
                        </div>

                        {/* Document rows */}
                        {pagedItems.length === 0 ? (
                          <p style={{ color: '#8a96b0', textAlign: 'center', padding: '20px 0', fontSize: '13px' }}>No records found.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {pagedItems.map(item => {
                              const isInvoice = clientOverviewTab === 'invoices';
                              const isQuotation = clientOverviewTab === 'quotations';
                              const isPO = clientOverviewTab === 'pos';
                              const isUpload = clientOverviewTab === 'uploads';

                              const docNo = item.invoice_no || item.quotation_no || item.po_no || item.file_name;
                              const docDate = item.invoice_date || item.quotation_date || item.po_date || item.upload_date;
                              const docAmount = item.gross_total;

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    if (isInvoice) { viewInvoiceDetail(item.id); }
                                    else if (isQuotation) setCurrentPage('quotations');
                                    else if (isPO) setCurrentPage('purchase-orders');
                                  }}
                                  style={{
                                    background: '#0e1829', borderRadius: '8px', padding: '10px 14px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    cursor: isUpload ? 'default' : 'pointer',
                                    border: '1px solid transparent',
                                    transition: 'border 0.15s, background 0.15s'
                                  }}
                                  onMouseEnter={e => { if (!isUpload) { e.currentTarget.style.border = `1px solid ${activeTab.color}40`; e.currentTarget.style.background = '#132030'; } }}
                                  onMouseLeave={e => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = '#0e1829'; }}
                                >
                                  <div style={{ overflow: 'hidden' }}>
                                    <span style={{ fontWeight: 'bold', color: '#F0A500', fontSize: '13px' }}>{docNo}</span>
                                    <span style={{ color: '#8a96b0', fontSize: '11px', marginLeft: '10px' }}>{docDate}</span>
                                    {isPO && item.vendor_or_client && (
                                      <span style={{ color: '#8a96b0', fontSize: '10px', marginLeft: '6px', background: 'rgba(240,165,0,.1)', padding: '2px 5px', borderRadius: '4px' }}>{item.vendor_or_client}</span>
                                    )}
                                    {isInvoice && (
                                      <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 'bold', color: item.payment_status === 'PAID' ? '#27ae60' : item.payment_status === 'PARTIAL' ? '#f39c12' : '#e74c3c', background: item.payment_status === 'PAID' ? 'rgba(39,174,96,.1)' : 'rgba(231,76,60,.1)', padding: '2px 6px', borderRadius: '4px' }}>{item.payment_status || 'UNPAID'}</span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    {docAmount !== undefined && (
                                      <span style={{ fontWeight: 'bold', color: activeTab.color, fontSize: '13px' }}>{formatCurrency(docAmount)}</span>
                                    )}
                                    {isUpload && (
                                      <button
                                        onClick={e => {
                                          e.stopPropagation();
                                          const bytes = atob(item.file_data);
                                          const arr = new Uint8Array(bytes.length);
                                          for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
                                          window.open(URL.createObjectURL(new Blob([arr], { type: item.file_type })), '_blank');
                                        }}
                                        style={{ padding: '3px 8px', background: 'rgba(155,89,182,.15)', border: '1px solid rgba(155,89,182,.3)', color: '#9b59b6', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}
                                      >View</button>
                                    )}
                                    {!isUpload && <span style={{ color: '#8a96b0', fontSize: '12px' }}>→</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
                            <button onClick={() => setClientOverviewPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                              style={{ padding: '5px 12px', background: safePage === 1 ? '#0e1829' : '#192338', border: '1px solid rgba(138,150,176,.25)', color: safePage === 1 ? '#4a5568' : 'white', borderRadius: '6px', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>← Prev</button>
                            <span style={{ fontSize: '12px', color: '#8a96b0' }}>Page {safePage} of {totalPages}</span>
                            <button onClick={() => setClientOverviewPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                              style={{ padding: '5px 12px', background: safePage === totalPages ? '#0e1829' : '#192338', border: '1px solid rgba(138,150,176,.25)', color: safePage === totalPages ? '#4a5568' : 'white', borderRadius: '6px', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}>Next →</button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>
              )}
            </div>
          )}

          {/* CLIENT LEDGER VIEW */}
          {currentPage === 'ledger' && (
            <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.15)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(240,165,0,.15)', paddingBottom: '16px' }}>
                <div style={{ minWidth: '200px' }}>
                  <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Select Client Account</label>
                  <select
                    value={selectedLedgerClientId}
                    onChange={(e) => setSelectedLedgerClientId(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Date From</label>
                  <input type="date" value={ledgerStartDate} onChange={(e) => setLedgerStartDate(e.target.value)} style={{ padding: '9px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Date To</label>
                  <input type="date" value={ledgerEndDate} onChange={(e) => setLedgerEndDate(e.target.value)} style={{ padding: '9px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
                </div>
                {selectedLedgerClientId && (
                  <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end', marginLeft: 'auto' }}>
                    <button
                      onClick={() => {
                        const cl = clients.find(c => c.id == selectedLedgerClientId);
                        if (cl) exportLedgerPDF({ client: cl, ledgerEntries, companySettings: company });
                      }}
                      style={{ padding: '10px 16px', background: '#27ae60', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Printer size={14} /> Export Ledger PDF
                    </button>
                  </div>
                )}
              </div>

              {!selectedLedgerClientId ? (
                <p style={{ color: '#8a96b0', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>Please select a client account to generate statement.</p>
              ) : (
                <div>
                  {/* Ledger statistics panels */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#0e1829', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
                      <span style={{ fontSize: '10px', color: '#8a96b0' }}>TOTAL CHARGED (DEBIT)</span>
                      <span style={{ fontSize: '20px', bold: true, color: 'white', display: 'block', marginTop: '4px' }}>
                        {formatCurrency(ledgerEntries.reduce((s, e) => s + (e.debit || 0), 0))}
                      </span>
                    </div>
                    <div style={{ background: '#0e1829', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #27ae60' }}>
                      <span style={{ fontSize: '10px', color: '#8a96b0' }}>TOTAL RECEIVED (CREDIT)</span>
                      <span style={{ fontSize: '20px', bold: true, color: 'white', display: 'block', marginTop: '4px' }}>
                        {formatCurrency(ledgerEntries.reduce((s, e) => s + (e.credit || 0), 0))}
                      </span>
                    </div>
                    <div style={{ background: '#0e1829', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #e74c3c' }}>
                      <span style={{ fontSize: '10px', color: '#8a96b0' }}>NET OUTSTANDING DUES</span>
                      <span style={{ fontSize: '20px', bold: true, color: '#e74c3c', display: 'block', marginTop: '4px' }}>
                        {formatCurrency(
                          ledgerEntries.reduce((s, e) => s + (e.debit || 0), 0) - ledgerEntries.reduce((s, e) => s + (e.credit || 0), 0)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Ledger Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#152035', borderBottom: '1px solid rgba(240,165,0,.15)' }}>
                          <th style={{ padding: '12px', color: '#F0A500' }}>Date</th>
                          <th style={{ padding: '12px', color: '#F0A500' }}>Description</th>
                          <th style={{ padding: '12px', color: '#F0A500', textAlign: 'right' }}>Debit (Charge)</th>
                          <th style={{ padding: '12px', color: '#F0A500', textAlign: 'right' }}>Credit (Receipt)</th>
                          <th style={{ padding: '12px', color: '#F0A500', textAlign: 'right' }}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerEntries
                          .filter(e => {
                            if (ledgerStartDate && new Date(e.date) < new Date(ledgerStartDate)) return false;
                            if (ledgerEndDate && new Date(e.date) > new Date(ledgerEndDate)) return false;
                            return true;
                          })
                          .map((entry, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(138,150,176,.15)' }}>
                              <td style={{ padding: '12px' }}>{entry.date}</td>
                              <td style={{ padding: '12px' }}>{entry.description}</td>
                              <td style={{ padding: '12px', textAlign: 'right', color: entry.debit > 0 ? '#3498db' : '#8a96b0' }}>
                                {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', color: entry.credit > 0 ? '#27ae60' : '#8a96b0' }}>
                                {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: entry.balance > 0 ? '#e74c3c' : '#27ae60' }}>
                                {formatCurrency(entry.balance)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REPORTS & SALES BREAKDOWNS */}
          {currentPage === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Date Filters bar */}
              <div style={{ background: '#192338', padding: '16px', borderRadius: '12px', border: '1px solid rgba(240,165,0,.15)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Date From</label>
                  <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} style={{ padding: '9px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Date To</label>
                  <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} style={{ padding: '9px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
                </div>
                <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                  <button
                    onClick={async () => {
                      // Fetch payments list
                      const res = await fetch('/api/payments');
                      const payments = await res.json();
                      exportToExcel({
                        invoices,
                        payments: Array.isArray(payments) ? payments : [],
                        clients,
                        quotations,
                        companyName: company.name
                      });
                    }}
                    style={{ padding: '10px 18px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <FileSpreadsheet size={16} /> Export Excel Summary Report
                  </button>
                </div>
              </div>

              {/* GST calculations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>

                {/* GST Split report */}
                <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.15)', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F0A500', marginBottom: '16px' }}>🏛️ Sales GST Breakdown Statement</h3>

                  {(() => {
                    let cgstTotal = 0;
                    let sgstTotal = 0;
                    let igstTotal = 0;
                    let taxableSales = 0;

                    invoices
                      .filter(inv => {
                        if (reportStartDate && new Date(inv.invoice_date) < new Date(reportStartDate)) return false;
                        if (reportEndDate && new Date(inv.invoice_date) > new Date(reportEndDate)) return false;
                        return true;
                      })
                      .forEach(inv => {
                        taxableSales += inv.subtotal;
                        cgstTotal += (inv.cgst_amount || 0);
                        sgstTotal += (inv.sgst_amount || 0);
                        igstTotal += (inv.igst_amount || 0);
                      });

                    return (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                          <div style={{ background: '#0e1829', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#8a96b0' }}>TAXABLE BASE</span>
                            <p style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '3px' }}>{formatCurrency(taxableSales)}</p>
                          </div>
                          <div style={{ background: '#0e1829', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#8a96b0' }}>CGST COLLECTED</span>
                            <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#F0A500', marginTop: '3px' }}>{formatCurrency(cgstTotal)}</p>
                          </div>
                          <div style={{ background: '#0e1829', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#8a96b0' }}>SGST COLLECTED</span>
                            <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#F0A500', marginTop: '3px' }}>{formatCurrency(sgstTotal)}</p>
                          </div>
                          <div style={{ background: '#0e1829', padding: '12px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#8a96b0' }}>IGST COLLECTED</span>
                            <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#F0A500', marginTop: '3px' }}>{formatCurrency(igstTotal)}</p>
                          </div>
                        </div>

                        <div style={{ background: 'rgba(39,174,96,.08)', border: '1px dashed #27ae60', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#8a96b0' }}>TOTAL GST LIABILITY</span>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60', marginTop: '4px' }}>
                              {formatCurrency(cgstTotal + sgstTotal + igstTotal)}
                            </p>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: '#8a96b0', display: 'block', textAlign: 'right' }}>GROSS SALES RECEIPTS</span>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60', marginTop: '4px', textAlign: 'right' }}>
                              {formatCurrency(taxableSales + cgstTotal + sgstTotal + igstTotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Collections distribution */}
                <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.15)', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F0A500', marginBottom: '16px' }}>💳 Cash-flow mode metrics</h3>
                  {(() => {
                    const modeMap = { CASH: 0, UPI: 0, BANK_TRANSFER: 0, CHEQUE: 0, CARD: 0, OTHER: 0 };

                    // Summing collections on active state (simulating stats)
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '12px', color: '#8a96b0' }}>Dockets categorized under various payment systems. To view granular logs, export summary spreadsheet dockets.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'].map((mode, i) => (
                            <div key={i} style={{ background: '#0e1829', padding: '10px', borderRadius: '6px' }}>
                              <span style={{ fontSize: '9px', color: '#8a96b0' }}>{mode.replace('_', ' ')}</span>
                              <span style={{ fontSize: '14px', bold: true, display: 'block', marginTop: '2px', color: '#F0A500' }}>Active</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* HSN Summary breakdown */}
              <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.15)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F0A500', marginBottom: '16px' }}>📦 HSN Summary Breakdown</h3>
                {(() => {
                  const hsnGroups = {};
                  invoices
                    .filter(inv => {
                      if (reportStartDate && new Date(inv.invoice_date) < new Date(reportStartDate)) return false;
                      if (reportEndDate && new Date(inv.invoice_date) > new Date(reportEndDate)) return false;
                      return true;
                    })
                    .forEach(inv => {
                      (inv.items || []).forEach(item => {
                        const hsn = item.hsn || 'NON-GST / MISC';
                        if (!hsnGroups[hsn]) {
                          hsnGroups[hsn] = { hsn, desc: item.desc || item.description, qty: 0, total: 0 };
                        }
                        hsnGroups[hsn].qty += (item.qty || 0);
                        hsnGroups[hsn].total += (item.total || 0);
                      });
                    });

                  const hsnList = Object.values(hsnGroups);

                  if (hsnList.length === 0) {
                    return <p style={{ color: '#8a96b0', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No invoice items recorded within date limits.</p>;
                  }

                  return (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#0e1829', color: '#8a96b0', borderBottom: '1px solid rgba(240,165,0,.1)' }}>
                            <th style={{ padding: '10px' }}>HSN Code</th>
                            <th style={{ padding: '10px' }}>Sample Description</th>
                            <th style={{ padding: '10px', textAlign: 'center' }}>Total Quantity</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Taxable Sales Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hsnList.map((g, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(138,150,176,.15)' }}>
                              <td style={{ padding: '10px', fontWeight: 'bold', color: '#F0A500' }}>{g.hsn}</td>
                              <td style={{ padding: '10px' }}>{g.desc}</td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>{g.qty}</td>
                              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(g.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

          {/* SETTINGS VIEW */}
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

                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F0A500', marginTop: '24px', marginBottom: '16px' }}>🏦 Bank Account Details</h3>
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

              {/* Password Update Form */}
              <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.18)', borderRadius: '12px', padding: '24px', marginTop: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#F0A500', marginBottom: '16px' }}>🔒 Update Password</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const currentPassword = e.target.currentPassword.value;
                    const newPassword = e.target.newPassword.value;
                    const confirmPassword = e.target.confirmPassword.value;

                    if (newPassword !== confirmPassword) {
                      showToast('New passwords do not match', 'error');
                      return;
                    }

                    try {
                      const res = await fetch('/api/auth', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword, newPassword })
                      });
                      const data = await res.json();
                      if (data.success) {
                        showToast('Password updated successfully', 'success');
                        e.target.reset();
                      } else {
                        showToast(data.message || 'Error updating password', 'error');
                      }
                    } catch (err) {
                      showToast('Server error', 'error');
                    }
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div>
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Current Password *</label>
                    <input name="currentPassword" type="password" required style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>New Password *</label>
                    <input name="newPassword" type="password" required style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Confirm New Password *</label>
                    <input name="confirmPassword" type="password" required style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                  </div>
                  <button
                    type="submit"
                    style={{
                      marginTop: '8px',
                      padding: '10px 24px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      alignSelf: 'flex-start'
                    }}
                  >
                    Update Password
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* NOTIFICATIONS DRAWER */}
      {showNotifications && (
        <div className="no-print" style={{ position: 'fixed', right: 0, top: 70, width: '350px', height: 'calc(100vh - 70px)', background: '#0e1829', borderLeft: '1px solid rgba(240,165,0,.18)', zIndex: 300, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(240,165,0,.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500' }}>🔔 Notifications</h3>
            <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: '#8a96b0', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {notifications.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#8a96b0' }}>No alerts or updates</p>
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

      {/* WHATSAPP REMINDER TEXTS PREVIEW MODAL */}
      {showReminderModal && reminderInvoice && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
          <div style={{ background: '#152035', border: '1px solid rgba(240,165,0,.18)', borderRadius: '14px', width: '100%', maxWidth: '600px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowReminderModal(false)} style={{ position: 'absolute', right: '20px', top: '16px', background: 'none', border: 'none', fontSize: '24px', color: '#8a96b0', cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Share2 size={20} /> WhatsApp Reminder dispatch</h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Choose Reminder template</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'created', label: 'Invoice Generated' },
                  { id: 'pending', label: 'Payment Pending' },
                  { id: 'partial', label: 'Partial Dues' },
                  { id: 'overdue', label: 'Overdue Warning' }
                ].map(t => {
                  const isPaid = reminderInvoice.payment_status === 'PAID' || reminderInvoice.remaining_amount <= 0;
                  const isDisabled = isPaid && ['pending', 'partial', 'overdue'].includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (!isDisabled) setReminderTemplate(t.id);
                      }}
                      disabled={isDisabled}
                      style={{
                        padding: '8px',
                        background: reminderTemplate === t.id ? '#F0A500' : 'rgba(240,165,0,.08)',
                        color: reminderTemplate === t.id ? '#111d33' : '#8a96b0',
                        border: '1px solid rgba(240,165,0,.25)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.4 : 1
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Message Preview</label>
              <textarea
                value={getReminderText()}
                readOnly
                rows="4"
                style={{ width: '100%', padding: '12px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px', resize: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReminderModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(138,150,176,.25)', color: '#8a96b0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              <button onClick={sendWhatsAppReminder} style={{ padding: '10px 20px', background: '#27ae60', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={14} /> Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLECT PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
          <div style={{ background: '#152035', border: '1px solid rgba(240,165,0,.18)', borderRadius: '14px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', right: '20px', top: '16px', background: 'none', border: 'none', fontSize: '24px', color: '#8a96b0', cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#F0A500', marginBottom: '24px' }}>
              {editingPaymentId ? '📝 Edit Payment Docket' : '💸 Collect Dues Payment'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Date received *</label>
                <input type="date" value={currentPayment.paymentDate} onChange={(e) => setCurrentPayment({ ...currentPayment, paymentDate: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Amount Paid (₹) *</label>
                <input type="number" placeholder="Enter amount" value={currentPayment.amount} onChange={(e) => setCurrentPayment({ ...currentPayment, amount: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Payment Mode *</label>
                <select value={currentPayment.paymentMode} onChange={(e) => setCurrentPayment({ ...currentPayment, paymentMode: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}>
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="CARD">CARD</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Transaction Ref / Cheque No</label>
                <input type="text" placeholder="TXN-92892..." value={currentPayment.referenceNumber} onChange={(e) => setCurrentPayment({ ...currentPayment, referenceNumber: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Transaction Notes</label>
                <input type="text" placeholder="Settled part payment dues..." value={currentPayment.notes} onChange={(e) => setCurrentPayment({ ...currentPayment, notes: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPaymentModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(138,150,176,.25)', color: '#8a96b0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              <button onClick={savePayment} style={{ padding: '10px 20px', background: '#27ae60', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Transaction</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>PO No</label>
                <input type="text" value={currentInvoice.poNo} onChange={(e) => setCurrentInvoice({ ...currentInvoice, poNo: e.target.value })} placeholder="e.g. PO-123" style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>PO Date</label>
                <input type="date" value={currentInvoice.poDate} onChange={(e) => setCurrentInvoice({ ...currentInvoice, poDate: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F0A500', marginBottom: '12px' }}>📦 Items</h3>
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid rgba(240,165,0,.2)' }}>
                <thead>
                  <tr style={{ background: 'rgba(240,165,0,.08)' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '45px' }}>Sr</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold' }}>Description</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '80px' }}>HSN</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '70px' }}>UOM</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '60px' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '90px' }}>Rate</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '70px' }}>CGST %</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '70px' }}>SGST %</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '80px' }}>Tax Amt</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '110px' }}>Total</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '30px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(240,165,0,.1)' }}>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.sr} onChange={(e) => updateInvoiceItem(idx, 'sr', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input placeholder="Description" value={item.desc} onChange={(e) => updateInvoiceItem(idx, 'desc', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input placeholder="HSN" value={item.hsn} onChange={(e) => updateInvoiceItem(idx, 'hsn', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}>
                        <input
                          placeholder="UOM"
                          value={item.uom || ''}
                          onChange={(e) => updateInvoiceItem(idx, 'uom', e.target.value)}
                          style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }}
                        />
                      </td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.qty} onChange={(e) => updateInvoiceItem(idx, 'qty', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.rate} onChange={(e) => updateInvoiceItem(idx, 'rate', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.cgstRate !== undefined ? item.cgstRate : 9} onChange={(e) => updateInvoiceItem(idx, 'cgstRate', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.sgstRate !== undefined ? item.sgstRate : 9} onChange={(e) => updateInvoiceItem(idx, 'sgstRate', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px', textAlign: 'right', color: '#8a96b0' }}>
                        ₹{getItemTaxAmount(item, currentInvoice.taxType, currentInvoice.discount, currentInvoice.items).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px', fontSize: '11px', background: 'rgba(240,165,0,.08)', fontWeight: 'bold', color: '#F0A500', textAlign: 'right' }}>₹{(item.qty * item.rate).toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}><button onClick={() => removeInvoiceItem(idx)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '14px' }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addInvoiceItem} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>+ Add Item</button>

            {/* Discount and Transport Charges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Discount (₹)</label>
                <input
                  id="invoice-discount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={currentInvoice.discount}
                  onChange={(e) => {
                    const discount = parseFloat(e.target.value) || 0;
                    const totals = calculateTotals(currentInvoice.items, currentInvoice.taxType, currentInvoice.cgstRate, currentInvoice.sgstRate, currentInvoice.igstRate, discount, currentInvoice.transportCharges, true);
                    setCurrentInvoice({ ...currentInvoice, discount, ...totals });
                  }}
                  style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(231,76,60,.4)', borderRadius: '8px', color: '#e74c3c', fontSize: '13px', fontWeight: 'bold' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Transport Charges (₹)</label>
                <input
                  id="invoice-transport-charges"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={currentInvoice.transportCharges}
                  onChange={(e) => {
                    const transportCharges = parseFloat(e.target.value) || 0;
                    const totals = calculateTotals(currentInvoice.items, currentInvoice.taxType, currentInvoice.cgstRate, currentInvoice.sgstRate, currentInvoice.igstRate, currentInvoice.discount, transportCharges, true);
                    setCurrentInvoice({ ...currentInvoice, transportCharges, ...totals });
                  }}
                  style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(39,174,96,.4)', borderRadius: '8px', color: '#27ae60', fontSize: '13px', fontWeight: 'bold' }}
                />
              </div>
            </div>

            <div style={{ background: 'rgba(240,165,0,.06)', border: '1px solid rgba(240,165,0,.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>SUBTOTAL</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500' }}>₹{currentInvoice.subtotal.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#e74c3c', margin: '0' }}>DISCOUNT</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#e74c3c' }}>-₹{(currentInvoice.discount || 0).toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#27ae60', margin: '0' }}>TRANSPORT</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#27ae60' }}>+₹{(currentInvoice.transportCharges || 0).toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>GRAND TOTAL</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500' }}>₹{currentInvoice.grossTotal.toFixed(2)}</p></div>
              </div>
            </div>

            {!editingInvoiceId && (
              <div style={{ background: '#192338', border: '1px solid rgba(240,165,0,.15)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    id="recordInitialPayment"
                    checked={!!currentInvoice.recordPayment}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, recordPayment: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="recordInitialPayment" style={{ fontSize: '13px', fontWeight: 'bold', color: '#F0A500', cursor: 'pointer' }}>💳 Record Initial Payment Received</label>
                </div>

                {currentInvoice.recordPayment && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Payment Date</label>
                      <input
                        type="date"
                        value={currentInvoice.paymentDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setCurrentInvoice({ ...currentInvoice, paymentDate: e.target.value })}
                        style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Amount Received (₹)</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={currentInvoice.paymentAmount !== undefined ? currentInvoice.paymentAmount : currentInvoice.grossTotal}
                        onChange={(e) => setCurrentInvoice({ ...currentInvoice, paymentAmount: e.target.value })}
                        style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Payment Mode</label>
                      <select
                        value={currentInvoice.paymentMode || 'UPI'}
                        onChange={(e) => setCurrentInvoice({ ...currentInvoice, paymentMode: e.target.value })}
                        style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                      >
                        <option value="UPI">UPI</option>
                        <option value="CASH">CASH</option>
                        <option value="BANK_TRANSFER">BANK TRANSFER</option>
                        <option value="CHEQUE">CHEQUE</option>
                        <option value="CARD">CARD</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Reference No</label>
                      <input
                        type="text"
                        placeholder="TXN Ref / Cheque No"
                        value={currentInvoice.paymentRef || ''}
                        onChange={(e) => setCurrentInvoice({ ...currentInvoice, paymentRef: e.target.value })}
                        style={{ width: '100%', padding: '8px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(240,165,0,.2)', paddingTop: '16px' }}>
              <button onClick={closeInvoiceModal} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={() => { setPreviewType('invoice'); setShowPreview(true); }} style={{ padding: '10px 20px', background: 'rgba(240,165,0,.2)', border: '1px solid rgba(240,165,0,.3)', color: '#F0A500', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>👁 Preview</button>
              <button onClick={saveInvoice} style={{ padding: '10px 20px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>✅ Save</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE QUOTATION MODAL */}
      {showQuotationModal && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Tax Type</label>
                <select value={currentQuotation.taxType} onChange={(e) => { const totals = calculateTotals(currentQuotation.items, e.target.value, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate, currentQuotation.discount, currentQuotation.transportCharges, true); setCurrentQuotation({ ...currentQuotation, taxType: e.target.value, ...totals }); }} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: '#F0A500', fontSize: '12px', fontWeight: 'bold' }}>
                  <option value="CGST_SGST">CGST + SGST</option>
                  <option value="IGST">IGST</option>
                  <option value="NONE">No Tax</option>
                </select>
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
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '45px' }}>Sr</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold' }}>Description</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '80px' }}>HSN</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '70px' }}>UOM</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '60px' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '90px' }}>Rate</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '70px' }}>CGST %</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '70px' }}>SGST %</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '80px' }}>Tax Amt</th>
                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '110px' }}>Total</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#F0A500', fontWeight: 'bold', width: '30px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentQuotation.items.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(240,165,0,.1)' }}>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.sr} onChange={(e) => updateQuotationItem(idx, 'sr', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input placeholder="Description" value={item.desc} onChange={(e) => updateQuotationItem(idx, 'desc', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input placeholder="HSN" value={item.hsn} onChange={(e) => updateQuotationItem(idx, 'hsn', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}>
                        <input
                          placeholder="UOM"
                          value={item.uom || ''}
                          onChange={(e) => updateQuotationItem(idx, 'uom', e.target.value)}
                          style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }}
                        />
                      </td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.qty} onChange={(e) => updateQuotationItem(idx, 'qty', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.rate} onChange={(e) => updateQuotationItem(idx, 'rate', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.cgstRate !== undefined ? item.cgstRate : 9} onChange={(e) => updateQuotationItem(idx, 'cgstRate', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px' }}><input type="number" value={item.sgstRate !== undefined ? item.sgstRate : 9} onChange={(e) => updateQuotationItem(idx, 'sgstRate', e.target.value)} style={{ width: '100%', padding: '4px', background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '4px', color: 'white' }} /></td>
                      <td style={{ padding: '8px', fontSize: '11px', textAlign: 'right', color: '#8a96b0' }}>
                        ₹{getItemTaxAmount(item, currentQuotation.taxType, currentQuotation.discount, currentQuotation.items).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px', fontSize: '11px', background: 'rgba(240,165,0,.08)', fontWeight: 'bold', color: '#F0A500', textAlign: 'right' }}>₹{(item.qty * item.rate).toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}><button onClick={() => removeQuotationItem(idx)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '14px' }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addQuotationItem} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>+ Add Item</button>

            {/* Discount and Transport Charges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Discount (₹)</label>
                <input
                  id="quotation-discount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={currentQuotation.discount}
                  onChange={(e) => {
                    const discount = parseFloat(e.target.value) || 0;
                    const totals = calculateTotals(currentQuotation.items, currentQuotation.taxType, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate, discount, currentQuotation.transportCharges, true);
                    setCurrentQuotation({ ...currentQuotation, discount, ...totals });
                  }}
                  style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(231,76,60,.4)', borderRadius: '8px', color: '#e74c3c', fontSize: '13px', fontWeight: 'bold' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Transport Charges (₹)</label>
                <input
                  id="quotation-transport-charges"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={currentQuotation.transportCharges}
                  onChange={(e) => {
                    const transportCharges = parseFloat(e.target.value) || 0;
                    const totals = calculateTotals(currentQuotation.items, currentQuotation.taxType, currentQuotation.cgstRate, currentQuotation.sgstRate, currentQuotation.igstRate, currentQuotation.discount, transportCharges, true);
                    setCurrentQuotation({ ...currentQuotation, transportCharges, ...totals });
                  }}
                  style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(39,174,96,.4)', borderRadius: '8px', color: '#27ae60', fontSize: '13px', fontWeight: 'bold' }}
                />
              </div>
            </div>

            <div style={{ background: 'rgba(240,165,0,.06)', border: '1px solid rgba(240,165,0,.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>SUBTOTAL</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500' }}>₹{currentQuotation.subtotal.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#e74c3c', margin: '0' }}>DISCOUNT</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#e74c3c' }}>-₹{(currentQuotation.discount || 0).toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#27ae60', margin: '0' }}>TRANSPORT</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#27ae60' }}>+₹{(currentQuotation.transportCharges || 0).toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>GRAND TOTAL</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500' }}>₹{currentQuotation.grossTotal.toFixed(2)}</p></div>
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

      {/* CREATE/EDIT CLIENT MODAL */}
      {showClientModal && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
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

      {/* PURCHASE ORDER MODAL */}
      {showPurchaseOrderModal && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
          <div style={{ background: '#152035', border: '1px solid rgba(240,165,0,.18)', borderRadius: '14px', width: '100%', maxWidth: '950px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={closePurchaseOrderModal} style={{ position: 'absolute', right: '20px', top: '16px', background: 'none', border: 'none', fontSize: '24px', color: '#8a96b0', cursor: 'pointer' }}>✕</button>

            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#F0A500', marginBottom: '24px' }}>{editingPurchaseOrderId ? '📝 Edit Purchase Order' : '📦 Create New Purchase Order'}</h2>

            {/* Basic Info - 5 columns: Type | Company | PO No | PO Date | Valid Until */}
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 160px 160px 160px', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Type</label>
                <select
                  value={currentPurchaseOrder.vendor_or_client}
                  onChange={(e) => setCurrentPurchaseOrder({ ...currentPurchaseOrder, vendor_or_client: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                >
                  <option value="CLIENT">Client</option>
                  <option value="VENDOR">Vendor</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Company *</label>
                <select
                  value={currentPurchaseOrder.clientId}
                  onChange={(e) => setCurrentPurchaseOrder({ ...currentPurchaseOrder, clientId: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                >
                  <option value="">Select Company</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>PO No. *</label>
                <input type="text" value={currentPurchaseOrder.poNo} onChange={(e) => setCurrentPurchaseOrder({ ...currentPurchaseOrder, poNo: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>PO Date *</label>
                <input type="date" value={currentPurchaseOrder.poDate} onChange={(e) => setCurrentPurchaseOrder({ ...currentPurchaseOrder, poDate: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Valid Until</label>
                <input type="date" value={currentPurchaseOrder.validUntil} onChange={(e) => setCurrentPurchaseOrder({ ...currentPurchaseOrder, validUntil: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>Item Details</h3>
                <button onClick={addPurchaseOrderItem} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Row</button>
              </div>
              <div style={{ background: '#0e1829', border: '1px solid rgba(138,150,176,.2)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,.05)', borderBottom: '1px solid rgba(138,150,176,.2)' }}>
                      <th style={{ padding: '10px', width: '40px', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '10px' }}>Description *</th>
                      <th style={{ padding: '10px', width: '80px' }}>HSN</th>
                      <th style={{ padding: '10px', width: '70px' }}>UOM</th>
                      <th style={{ padding: '10px', width: '60px', textAlign: 'center' }}>Qty *</th>
                      <th style={{ padding: '10px', width: '90px', textAlign: 'right' }}>Rate *</th>
                      <th style={{ padding: '10px', width: '70px', textAlign: 'center' }}>CGST %</th>
                      <th style={{ padding: '10px', width: '70px', textAlign: 'center' }}>SGST %</th>
                      <th style={{ padding: '10px', width: '80px', textAlign: 'right' }}>Tax Amt</th>
                      <th style={{ padding: '10px', width: '110px', textAlign: 'right' }}>Total (₹)</th>
                      <th style={{ padding: '10px', width: '30px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPurchaseOrder.items.map((item, index) => (
                      <tr key={index} style={{ borderBottom: index < currentPurchaseOrder.items.length - 1 ? '1px solid rgba(138,150,176,.1)' : 'none' }}>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#8a96b0' }}>{item.sr}</td>
                        <td style={{ padding: '6px' }}>
                          <textarea rows="2" value={item.desc} onChange={(e) => {
                            const newItems = [...currentPurchaseOrder.items];
                            newItems[index].desc = e.target.value;
                            setCurrentPurchaseOrder({ ...currentPurchaseOrder, items: newItems });
                          }} style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,.05)', border: '1px solid transparent', borderRadius: '4px', color: 'white', fontSize: '13px', resize: 'vertical' }} placeholder="Material/Service detail..." />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" value={item.hsn} onChange={(e) => {
                            const newItems = [...currentPurchaseOrder.items];
                            newItems[index].hsn = e.target.value;
                            setCurrentPurchaseOrder({ ...currentPurchaseOrder, items: newItems });
                          }} style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,.05)', border: '1px solid transparent', borderRadius: '4px', color: 'white', fontSize: '13px' }} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" value={item.uom || ''} placeholder="UOM" onChange={(e) => {
                            const newItems = [...currentPurchaseOrder.items];
                            newItems[index].uom = e.target.value;
                            setCurrentPurchaseOrder({ ...currentPurchaseOrder, items: newItems });
                          }} style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,.05)', border: '1px solid transparent', borderRadius: '4px', color: 'white', fontSize: '13px' }} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="number" min="1" value={item.qty} onChange={(e) => {
                            const newItems = [...currentPurchaseOrder.items];
                            newItems[index].qty = parseFloat(e.target.value) || 0;
                            newItems[index].total = newItems[index].qty * newItems[index].rate;
                            const totals = calculateTotals(newItems, currentPurchaseOrder.taxType, currentPurchaseOrder.cgstRate, currentPurchaseOrder.sgstRate, currentPurchaseOrder.igstRate, currentPurchaseOrder.discount, currentPurchaseOrder.transportCharges, true);
                            setCurrentPurchaseOrder({ ...currentPurchaseOrder, items: newItems, ...totals });
                          }} style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,.05)', border: '1px solid transparent', borderRadius: '4px', color: 'white', fontSize: '13px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="number" min="0" value={item.rate} onChange={(e) => {
                            const newItems = [...currentPurchaseOrder.items];
                            newItems[index].rate = parseFloat(e.target.value) || 0;
                            newItems[index].total = newItems[index].qty * newItems[index].rate;
                            const totals = calculateTotals(newItems, currentPurchaseOrder.taxType, currentPurchaseOrder.cgstRate, currentPurchaseOrder.sgstRate, currentPurchaseOrder.igstRate, currentPurchaseOrder.discount, currentPurchaseOrder.transportCharges, true);
                            setCurrentPurchaseOrder({ ...currentPurchaseOrder, items: newItems, ...totals });
                          }} style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,.05)', border: '1px solid transparent', borderRadius: '4px', color: 'white', fontSize: '13px', textAlign: 'right' }} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="number" min="0" value={item.cgstRate !== undefined ? item.cgstRate : 9} onChange={(e) => {
                            const newItems = [...currentPurchaseOrder.items];
                            newItems[index].cgstRate = parseFloat(e.target.value) || 0;
                            const totals = calculateTotals(newItems, currentPurchaseOrder.taxType, currentPurchaseOrder.cgstRate, currentPurchaseOrder.sgstRate, currentPurchaseOrder.igstRate, currentPurchaseOrder.discount, currentPurchaseOrder.transportCharges, true);
                            setCurrentPurchaseOrder({ ...currentPurchaseOrder, items: newItems, ...totals });
                          }} style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,.05)', border: '1px solid transparent', borderRadius: '4px', color: 'white', fontSize: '13px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="number" min="0" value={item.sgstRate !== undefined ? item.sgstRate : 9} onChange={(e) => {
                            const newItems = [...currentPurchaseOrder.items];
                            newItems[index].sgstRate = parseFloat(e.target.value) || 0;
                            const totals = calculateTotals(newItems, currentPurchaseOrder.taxType, currentPurchaseOrder.cgstRate, currentPurchaseOrder.sgstRate, currentPurchaseOrder.igstRate, currentPurchaseOrder.discount, currentPurchaseOrder.transportCharges, true);
                            setCurrentPurchaseOrder({ ...currentPurchaseOrder, items: newItems, ...totals });
                          }} style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,.05)', border: '1px solid transparent', borderRadius: '4px', color: 'white', fontSize: '13px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#8a96b0' }}>
                          ₹{getItemTaxAmount(item, currentPurchaseOrder.taxType, currentPurchaseOrder.discount, currentPurchaseOrder.items).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{item.total.toFixed(2)}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {currentPurchaseOrder.items.length > 1 && (
                            <button onClick={() => removePurchaseOrderItem(index)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '4px' }}>✕</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px', background: '#0e1829', padding: '20px', borderRadius: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Tax Configuration</label>
                <select
                  value={currentPurchaseOrder.taxType}
                  onChange={(e) => {
                    const taxType = e.target.value;
                    const totals = calculateTotals(currentPurchaseOrder.items, taxType, currentPurchaseOrder.cgstRate, currentPurchaseOrder.sgstRate, currentPurchaseOrder.igstRate, currentPurchaseOrder.discount, currentPurchaseOrder.transportCharges, true);
                    setCurrentPurchaseOrder({ ...currentPurchaseOrder, taxType, ...totals });
                  }}
                  style={{ width: '100%', padding: '10px', background: '#192338', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                >
                  <option value="CGST_SGST">CGST + SGST</option>
                  <option value="IGST">IGST Only</option>
                  <option value="NONE">No GST</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={currentPurchaseOrder.discount}
                  onChange={(e) => {
                    const discount = parseFloat(e.target.value) || 0;
                    const totals = calculateTotals(currentPurchaseOrder.items, currentPurchaseOrder.taxType, currentPurchaseOrder.cgstRate, currentPurchaseOrder.sgstRate, currentPurchaseOrder.igstRate, discount, currentPurchaseOrder.transportCharges, true);
                    setCurrentPurchaseOrder({ ...currentPurchaseOrder, discount, ...totals });
                  }}
                  style={{ width: '100%', padding: '10px', background: '#192338', border: '1px solid rgba(231,76,60,.4)', borderRadius: '8px', color: '#e74c3c', fontSize: '13px', fontWeight: 'bold' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Transport Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={currentPurchaseOrder.transportCharges}
                  onChange={(e) => {
                    const transportCharges = parseFloat(e.target.value) || 0;
                    const totals = calculateTotals(currentPurchaseOrder.items, currentPurchaseOrder.taxType, currentPurchaseOrder.cgstRate, currentPurchaseOrder.sgstRate, currentPurchaseOrder.igstRate, currentPurchaseOrder.discount, transportCharges, true);
                    setCurrentPurchaseOrder({ ...currentPurchaseOrder, transportCharges, ...totals });
                  }}
                  style={{ width: '100%', padding: '10px', background: '#192338', border: '1px solid rgba(39,174,96,.4)', borderRadius: '8px', color: '#27ae60', fontSize: '13px', fontWeight: 'bold' }}
                />
              </div>
            </div>

            <div style={{ background: 'rgba(240,165,0,.06)', border: '1px solid rgba(240,165,0,.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>SUBTOTAL</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500' }}>₹{(currentPurchaseOrder.subtotal || 0).toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#e74c3c', margin: '0' }}>DISCOUNT</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#e74c3c' }}>-₹{(currentPurchaseOrder.discount || 0).toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#27ae60', margin: '0' }}>TRANSPORT</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#27ae60' }}>+₹{(currentPurchaseOrder.transportCharges || 0).toFixed(2)}</p></div>
                <div><p style={{ fontSize: '10px', color: '#8a96b0', margin: '0' }}>GRAND TOTAL</p><p style={{ fontSize: '16px', fontWeight: '700', color: '#F0A500' }}>₹{(currentPurchaseOrder.grossTotal || 0).toFixed(2)}</p></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(240,165,0,.2)', paddingTop: '16px' }}>
              <button onClick={closePurchaseOrderModal} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={() => { setPreviewType('purchase_order'); setShowPreview(true); }} style={{ padding: '10px 20px', background: 'rgba(240,165,0,.2)', border: '1px solid rgba(240,165,0,.3)', color: '#F0A500', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>👁 Preview</button>
              <button onClick={savePurchaseOrder} style={{ padding: '10px 20px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>✅ Save</button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PO MODAL */}
      {showUploadPOModal && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
          <div style={{ background: '#152035', border: '1px solid rgba(240,165,0,.18)', borderRadius: '14px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowUploadPOModal(false)} style={{ position: 'absolute', right: '20px', top: '16px', background: 'none', border: 'none', fontSize: '24px', color: '#8a96b0', cursor: 'pointer' }}>✕</button>

            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#F0A500', marginBottom: '24px' }}>📤 Upload Purchase Order</h2>

            <form onSubmit={async (e) => {
              e.preventDefault();
              await saveUploadedPO();
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Vendor / Client *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={currentUploadedPO.vendor_or_client}
                    onChange={(e) => setCurrentUploadedPO({ ...currentUploadedPO, vendor_or_client: e.target.value })}
                    style={{ padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                  >
                    <option value="CLIENT">Client</option>
                    <option value="VENDOR">Vendor</option>
                  </select>
                  <select
                    value={currentUploadedPO.clientId}
                    onChange={(e) => setCurrentUploadedPO({ ...currentUploadedPO, clientId: e.target.value })}
                    style={{ flex: 1, padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                    required
                  >
                    <option value="">Select Company</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Select File (PDF or Image) *</label>
                <input
                  type="file"
                  accept="application/pdf, image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64String = event.target.result.split(',')[1];
                        setCurrentUploadedPO({
                          ...currentUploadedPO,
                          fileName: file.name,
                          fileType: file.type,
                          fileData: base64String
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a96b0', display: 'block', marginBottom: '6px' }}>Notes</label>
                <textarea
                  value={currentUploadedPO.notes}
                  onChange={(e) => setCurrentUploadedPO({ ...currentUploadedPO, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0e1829', border: '1px solid rgba(138,150,176,.25)', borderRadius: '8px', color: 'white', fontSize: '13px', resize: 'vertical' }}
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(240,165,0,.2)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowUploadPOModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(240,165,0,.3)', color: '#8a96b0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>📤 Upload File</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT/PREVIEW INTERACTIVE POPUP */}
      {showPreview && (
        <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '20px' }}>
          <div className="print-modal-container" style={{ background: '#152035', border: '1px solid rgba(240,165,0,.18)', borderRadius: '14px', width: '100%', maxWidth: '950px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <div className="no-print" style={{ display: 'flex', gap: '12px', marginBottom: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => window.print()} style={{ padding: '10px 20px', background: '#F0A500', color: '#111d33', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={16} /> Print / PDF
                </button>
              </div>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#8a96b0', cursor: 'pointer' }}>✕</button>
            </div>
            <DocumentPreview
              type={previewType}
              data={previewType === 'invoice' ? currentInvoice : previewType === 'quotation' ? currentQuotation : currentPurchaseOrder}
            />
          </div>
        </div>
      )}



      {confirmConfig && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#152035', border: '1px solid rgba(231,76,60,.3)', borderRadius: '12px', padding: '24px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: '#e74c3c', fontSize: '18px', marginBottom: '12px', fontWeight: 'bold' }}>{confirmConfig.title}</h3>
            <p style={{ color: '#8a96b0', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>{confirmConfig.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmConfig(null)}
                style={{ padding: '8px 16px', background: 'rgba(255,255,255,.05)', border: 'none', borderRadius: '6px', color: '#8a96b0', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }}
                style={{ padding: '8px 16px', background: '#e74c3c', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={poInputRef}
        style={{ display: 'none' }}
        onChange={handlePOFileChange}
        accept="application/pdf, image/*"
      />

    </div>
  );
};

export default EverReadySystem;
