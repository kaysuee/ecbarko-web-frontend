import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const COLORS = {
  primary: [15, 23, 42], secondary: [71, 85, 105], accent: [37, 99, 235],
  success: [5, 150, 105], danger: [220, 38, 38], background: [248, 250, 252],
  border: [226, 232, 240], text: [51, 65, 85]
};

const FONTS = {
  title: { size: 20, weight: 'bold' }, subtitle: { size: 16, weight: 'normal' },
  heading: { size: 14, weight: 'bold' }, body: { size: 11, weight: 'normal' },
  small: { size: 10, weight: 'normal' }, tiny: { size: 8, weight: 'normal' }
};

const addHeader = (pdf, title, subtitle = '') => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(FONTS.title.size);
  pdf.setFont('helvetica', FONTS.title.weight);
  pdf.text('EcBarko Analytics', 20, 20);
  if (subtitle) {
    pdf.setFontSize(FONTS.subtitle.size);
    pdf.text(subtitle, 20, 28);
  }
  pdf.setFontSize(FONTS.small.size);
  pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth - 80, 20);
  pdf.setTextColor(0, 0, 0);
};

const addFooter = (pdf, pageNumber, totalPages) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.line(20, 280, pageWidth - 20, 280);
  pdf.setTextColor(...COLORS.secondary);
  pdf.setFontSize(FONTS.tiny.size);
  pdf.text('EcBarko Analytics Report', 20, 285);
  pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 30, 285);
  pdf.text('Confidential - Internal Use Only', pageWidth / 2 - 20, 285);
};

const addSummarySection = (pdf, title, summaryText, statusCards) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = 50;
  
  pdf.setFillColor(...COLORS.background);
  pdf.rect(20, currentY, pageWidth - 40, 8, 'F');
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont('helvetica', FONTS.heading.weight);
  pdf.text('Executive Summary', 25, currentY + 6);
  currentY += 20;
  
  if (summaryText) {
    pdf.setTextColor(...COLORS.text);
    pdf.setFontSize(FONTS.body.size);
    pdf.setFont('helvetica', FONTS.body.weight);
    pdf.text(summaryText, 25, currentY);
    currentY += 15;
  }
  
  if (statusCards && statusCards.length > 0) {
    const cardWidth = (pageWidth - 80) / Math.min(statusCards.length, 3);
    statusCards.forEach((card, index) => {
      const x = 20 + (index % 3) * (cardWidth + 20);
      const y = currentY;
      
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(...COLORS.border);
      pdf.rect(x, y, cardWidth, 35, 'FD');
      
      pdf.setTextColor(...card.color);
      pdf.setFontSize(FONTS.subtitle.size);
      pdf.text(card.icon || '', x + 10, y + 15);
      
      pdf.setTextColor(...COLORS.secondary);
      pdf.setFontSize(FONTS.small.size);
      pdf.text(card.title, x + 20, y + 15);
      
      pdf.setTextColor(...COLORS.primary);
      pdf.setFontSize(FONTS.title.size);
      pdf.setFont('helvetica', 'bold');
      pdf.text(card.value.toString(), x + 10, y + 28);
    });
  }
  
  return currentY + 50;
};

const addTableData = (pdf, data, columns, columnWidths) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 70;
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    pdf.setTextColor(...COLORS.text);
    pdf.setFontSize(FONTS.body.size);
    pdf.text('No data available', 20, currentY + 20);
    return;
  }
  
  if (!columns || typeof columns !== 'object') {
    pdf.setTextColor(...COLORS.text);
    pdf.setFontSize(FONTS.body.size);
    pdf.text('Invalid column configuration', 20, currentY + 20);
    return;
  }

  const headers = Object.keys(columns);
  let startX = 20;
  
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(startX, currentY, pageWidth - 40, 12, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(FONTS.body.size);
  pdf.setFont('helvetica', 'bold');
  
  headers.forEach((header, index) => {
    pdf.text(columns[header].label || header, startX + 5, currentY + 8);
    startX += columnWidths[index] || 50; 
  });
  currentY += 12;
  
  data.forEach((item, index) => {
    if (currentY > pageHeight - 30) {
      pdf.addPage();
      currentY = 20;
    }
    
    startX = 20;
    const rowHeight = 10;
    
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(startX, currentY, pageWidth - 40, rowHeight, 'F');
    }
    
    headers.forEach((key, colIndex) => {
      const config = columns[key];
      let value = item[config.field || key];
      
      if (config.formatter) {
        try {
          value = config.formatter(value, item);
        } catch (err) {
          console.warn('Formatter error for field', key, err);
          value = 'Error';
        }
      }
      
      if (config.color) {
        try {
          pdf.setTextColor(...config.color(value, item));
        } catch (err) {
          console.warn('Color function error for field', key, err);
          pdf.setTextColor(...COLORS.text);
        }
      } else {
        pdf.setTextColor(...COLORS.text);
      }
      
      pdf.setFontSize(FONTS.small.size);
      pdf.setFont('helvetica', 'normal');
      
      const text = typeof value === 'string' && value.length > 20 ? value.substring(0, 20) + '...' : (value || 'N/A');
      pdf.text(text.toString(), startX + 2, currentY + 7);
      startX += columnWidths[colIndex] || 50; 
    });
    
    currentY += rowHeight;
    pdf.setDrawColor(...COLORS.border);
    pdf.setLineWidth(0.1);
    pdf.line(20, currentY, pageWidth - 20, currentY);
  });
};

// Main PDF Generation Function
export const generateStructuredPDF = async (data, config, filename) => {
  try {
    toast.loading('Generating PDF...');
    const pdf = new jsPDF('l', 'mm', 'a4');
    addHeader(pdf, config.title, config.subtitle);
    const summaryText = config.summaryStats ? config.summaryStats(data) : null;
    const statusCards = config.statusCards ? config.statusCards(data) : null;
    addSummarySection(pdf, config.title, summaryText, statusCards);
    
    pdf.addPage();
    addHeader(pdf, config.tableTitle || config.title, 'Complete Data Listing');
    addTableData(pdf, data, config.columns, config.columnWidths);
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i, totalPages);
    }
    
    pdf.save(`${filename}.pdf`);
    toast.dismiss();
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};

//Dashboard PDF
export const generateDashboardDataPDF = async (filename, title, dashboardData) => {
  try {
    toast.loading('Generating PDF...');
    const pdf = new jsPDF('l', 'mm', 'a4'); 
    addHeader(pdf, title, 'Dashboard Analytics Report');
    const statusCards = [
      { title: 'Total Users', value: dashboardData.userStats.total, color: COLORS.success, icon: '👥' },
      { title: 'Active Cards', value: dashboardData.cardStats.active, color: COLORS.accent, icon: '💳' },
      { title: 'Booking Payments', value: `₱${dashboardData.revenueCurrentMonth.toLocaleString()}`, color: dashboardData.revenueChangePercent >= 0 ? COLORS.success : COLORS.danger, icon: '💰' }
    ];

    addSummarySection(
      pdf,
      'Dashboard Overview',
      `User Growth: +${dashboardData.userPercentageChange.toFixed(1)}% | Card Growth: +${dashboardData.cardPercentageChange.toFixed(1)}% | Sales Change: ${dashboardData.revenueChangePercent >= 0 ? '+' : ''}${dashboardData.revenueChangePercent.toFixed(1)}%`,
      statusCards
    );

    const chartSelectors = [
      '.totalUsers .recharts-wrapper',
      '.active-cards .recharts-wrapper',
      '.total-revenue .recharts-wrapper'
    ];

    const chartTitles = [
      'User Growth Analytics',
      'Card Activation Metrics',
      'Monthly Booking Payments Performance'
    ];

    const chartInsights = [
      (data) => {
        const change = data.userPercentageChange.toFixed(1);
        return `User registrations increased by ${change}% compared to the previous period, indicating steady growth.`;
      },
      (data) => {
        const change = data.cardPercentageChange.toFixed(1);
        return `Card activations grew by ${change}% this month, showing stronger adoption of the system.`;
      },
      (data) => {
        const change = data.revenueChangePercent.toFixed(1);
        const trend = data.revenueChangePercent >= 0 ? 'an increase' : 'a decline';
        return `Monthly booking payments reached ₱${data.revenueCurrentMonth.toLocaleString()}. \nReflecting ${trend} of ${change}% compared to last month.`;
      }
      
    ];

    for (let i = 0; i < chartSelectors.length; i++) {
      const chartElement = document.querySelector(chartSelectors[i]);
      if (!chartElement) continue;

      pdf.addPage();
      addHeader(pdf, 'Dashboard Analytics', chartTitles[i]);

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const chartMaxWidth = pageWidth * 0.7;
      const chartMaxHeight = pageHeight * 0.4;
      const chartX = (pageWidth - chartMaxWidth) / 2;
      const chartY = 50;

      try {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', chartX, chartY, chartMaxWidth, chartMaxHeight);

        pdf.setTextColor(...COLORS.text);
        pdf.setFontSize(FONTS.body.size);
        pdf.setFont('helvetica', 'normal');

        const insight = `Insight: ${chartInsights[i](dashboardData)}`;
        const wrappedInsight = pdf.splitTextToSize(insight, pageWidth - 60);

        pdf.text(wrappedInsight, 30, chartY + chartMaxHeight + 10);

      } catch (error) {
        console.error(`Failed to capture chart ${chartTitles[i]}:`, error);
        pdf.setTextColor(...COLORS.secondary);
        pdf.setFontSize(FONTS.body.size);
        pdf.text('Chart visualization unavailable', 30, chartY + 20);
      }
    }

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i, totalPages);
    }

    pdf.save(`${filename}.pdf`);
    toast.dismiss();
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};

const formatCurrency = (value) => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  return isNaN(num) ? '₱0.00' : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num);
};

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : '';

const formatTime12Hour = (time) => {
  if (!time) return '';
  let [hour, minute] = time.split(':');
  hour = parseInt(hour, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

const PAGE_CONFIGS = {
  ecbarkoCards: {
    title: 'EcBarko Card Management',
    subtitle: 'Card Management Report',
    tableTitle: 'Card Directory',
    summaryStats: (data) => {
      const active = data.filter(c => c.status === 'active').length;
      const deactivated = data.filter(c => c.status === 'deactivated').length;
      return `Total: ${data.length} | Active: ${active} | Deactivated: ${deactivated}`;
    },
    statusCards: (data) => [
      { title: 'Active Cards', value: data.filter(c => c.status === 'active').length, color: COLORS.success, icon: '✓' },
      { title: 'Deactivated', value: data.filter(c => c.status === 'deactivated').length, color: COLORS.danger, icon: '✗' }
    ],
    columns: {
      name: { label: 'Account Name' },
      userId: { label: 'User ID' },
      cardNumber: { label: 'Card Number' },
      balance: { label: 'Balance', formatter: formatCurrency },
      status: { label: 'Status', color: (status) => status === 'active' ? COLORS.success : COLORS.danger }
    },
    columnWidths: [60, 40, 60, 50, 30]
  },
  
  bookings: {
    title: 'Bookings Management',
    subtitle: 'Booking Records Report',
    summaryStats: (data) => {
      const active = data.filter(b => b.status === 'active').length;
      return `Total: ${data.length} | Active: ${active} | Cancelled: ${data.length - active}`;
    },
    statusCards: (data) => [
      { title: 'Active Bookings', value: data.filter(b => b.status === 'active').length, color: COLORS.success, icon: '✓' },
      { title: 'Cancelled', value: data.filter(b => b.status === 'cancelled').length, color: COLORS.danger, icon: '✗' }
    ],
    columns: {
      bookingReference: { label: 'Booking ID' },
      route: { label: 'Route', formatter: (_, item) => `${item.departureLocation} → ${item.arrivalLocation}` },
      schedule: { label: 'Date & Time', formatter: (_, item) => `${formatDate(item.departDate)} ${formatTime12Hour(item.departTime)}` },
      passengers: { label: 'Passengers', formatter: (passengers) => Array.isArray(passengers) ? passengers.length : '0' },
      userID: { label: 'User ID' },
      totalFare: { label: 'Payment', formatter: (fare) => `₱${fare}` },
      status: { label: 'Status', color: (status) => status === 'active' ? COLORS.success : COLORS.danger }
    },
    columnWidths: [35, 50, 45, 25, 30, 30, 25]
  },
  
  schedules: {
    title: 'Schedule Management',
    subtitle: 'Ferry Schedule Report',
    summaryStats: (data) => `Total: ${data.length} | Available Seats: ${data.reduce((sum, s) => sum + ((s.passengerCapacity || 0) - (s.passengerBooked || 0)), 0)}`,
    statusCards: (data) => [
      { title: 'Schedules', value: data.length, color: COLORS.accent, icon: '📅' },
      { title: 'Available Seats', value: data.reduce((sum, s) => sum + ((s.passengerCapacity || 0) - (s.passengerBooked || 0)), 0), color: COLORS.success, icon: '💺' }
    ],
    columns: {
      schedcde: { label: 'Code' },
      date: { label: 'Date' },
      departureTime: { label: 'Departure', formatter: formatTime12Hour },
      from: { label: 'From' },
      to: { label: 'To' },
      shippingLines: { label: 'Shipping Line' },
      availability: { label: 'Seats Left', formatter: (_, item) => `${((item.passengerCapacity || 0) - (item.passengerBooked || 0))} left` }
    },
    columnWidths: [35, 30, 30, 35, 35, 50, 35]
  },
  
  tapHistory: {
    title: 'Tap History Records',
    subtitle: 'Card Tap Activity Report',
    summaryStats: (data) => {
      const allowed = data.filter(h => h.hasActiveBooking).length;
      return `Total: ${data.length} | Allowed: ${allowed} | Denied: ${data.length - allowed}`;
    },
    statusCards: (data) => [
      { title: 'Total Taps', value: data.length, color: COLORS.accent, icon: '👆' },
      { title: 'Entry Allowed', value: data.filter(h => h.hasActiveBooking).length, color: COLORS.success, icon: '✓' }
    ],
    columns: {
      name: { label: 'User' },
      cardNo: { label: 'Card No' },
      vehicleType: { label: 'Vehicle Type' },
      timestamp: { label: 'Date & Time', formatter: (_, item) => new Date(item.clientTimestamp || item.createdAt).toLocaleString() },
      status: { label: 'Status', formatter: (_, item) => item.hasActiveBooking ? 'Allowed' : 'Denied', color: (_, item) => item.hasActiveBooking ? COLORS.success : COLORS.danger },
      payment: { label: 'Payment', formatter: (_, item) => `${item.paymentStatus} (₱${Number(item.amount).toFixed(2)})` }
    },
    columnWidths: [40, 35, 30, 50, 30, 55]
  },
  
  auditTrails: {
    title: 'Audit Trails',
    subtitle: 'System Activity Report',
    summaryStats: (data) => `Total Records: ${data.length} | Users: ${new Set(data.map(a => a.userID)).size}`,
    statusCards: (data) => [
      { title: 'Records', value: data.length, color: COLORS.accent, icon: '📝' },
      { title: 'Unique Users', value: new Set(data.map(a => a.userID)).size, color: COLORS.success, icon: '👤' }
    ],
    columns: {
      date: { label: 'Date' },
      userID: { label: 'User ID' },
      name: { label: 'Name' },
      action: { label: 'Action' }
    },
    columnWidths: [50, 60, 60, 120]
  },

  users: {
    title: 'User Management',
    subtitle: 'User Accounts Report',
    tableTitle: 'User Directory',
    summaryStats: (data) => {
      const active = data.filter(u => u.status === 'active').length;
      const deactivated = data.filter(u => u.status === 'deactivated').length;
      const inactive = data.filter(u => u.status === 'inactive').length;
      return `Total: ${data.length} | Active: ${active} | Deactivated: ${deactivated} | Inactive: ${inactive}`;
    },
    statusCards: (data) => [
      { title: 'Total Users', value: data.length, color: COLORS.accent, icon: '👥' },
      { title: 'Active Users', value: data.filter(u => u.status === 'active').length, color: COLORS.success, icon: '✓' },
      { title: 'Deactivated', value: data.filter(u => u.status === 'deactivated').length, color: COLORS.danger, icon: '✗' }
    ],
    columns: {
      name: { label: 'Account Name' },
      userId: { label: 'User ID' },
      email: { label: 'Email' },
      phone: { label: 'Phone' },
      status: { label: 'Status', color: (status) => {
        if (status === 'active') return COLORS.success;
        if (status === 'deactivated') return COLORS.danger;
        return COLORS.secondary;
      }}
    },
    columnWidths: [60, 40, 70, 50, 30]
  },

  ticketClerks: {
    title: 'Ticket Clerks Management',
    subtitle: 'Ticket Clerk Accounts Report',
    tableTitle: 'Ticket Clerk Directory',
    summaryStats: (data) => {
      const active = data.filter(tc => tc.status === 'active').length;
      const deactivated = data.filter(tc => tc.status === 'deactivated').length;
      return `Total: ${data.length} | Active: ${active} | Deactivated: ${deactivated}`;
    },
    statusCards: (data) => [
      { title: 'Total Clerks', value: data.length, color: COLORS.accent, icon: '👤' },
      { title: 'Active Clerks', value: data.filter(tc => tc.status === 'active').length, color: COLORS.success, icon: '✓' },
      { title: 'Deactivated', value: data.filter(tc => tc.status === 'deactivated').length, color: COLORS.danger, icon: '✗' }
    ],
    columns: {
      name: { label: 'Name' },
      clerkId: { label: 'Clerk ID' },
      email: { label: 'Email' },
      status: { label: 'Status', color: (status) => status === 'active' ? COLORS.success : COLORS.danger }
    },
    columnWidths: [70, 50, 80, 40]
  },

  admins: {
    title: 'Admin Management',
    subtitle: 'Admin Accounts Report',
    tableTitle: 'Admin Directory',
    summaryStats: (data) => {
      const active = data.filter(a => a.status === 'active').length;
      const deactivated = data.filter(a => a.status === 'deactivated').length;
      const archived = data.filter(a => a.status === 'archived').length;
      return `Total: ${data.length} | Active: ${active} | Deactivated: ${deactivated} | Archived: ${archived}`;
    },
    statusCards: (data) => [
      { title: 'Total Admins', value: data.length, color: COLORS.accent, icon: '⚡' },
      { title: 'Active Admins', value: data.filter(a => a.status === 'active').length, color: COLORS.success, icon: '✓' },
      { title: 'Deactivated', value: data.filter(a => a.status === 'deactivated').length, color: COLORS.danger, icon: '✗' }
    ],
    columns: {
      name: { label: 'Admin Name' },
      adminId: { label: 'Admin ID' },
      email: { label: 'Email' },
      role: { label: 'Role' },
      status: { label: 'Status', color: (status) => {
        if (status === 'active') return COLORS.success;
        if (status === 'deactivated') return COLORS.danger;
        if (status === 'archived') return COLORS.secondary;
        return COLORS.text;
      }}
    },
    columnWidths: [60, 50, 80, 40, 40]
  }
};

export const generateFareCategoriesPDF = (data, filename = 'fare-categories-report') => 
  generateStructuredPDF(data, PAGE_CONFIGS.fareCategories, filename);

export const generateEcBarkoCardsPDF = (data, filename = 'ecbarko-cards-report') => 
  generateStructuredPDF(data, PAGE_CONFIGS.ecbarkoCards, filename);

export const generateBookingsPDF = (data, filename = 'bookings-report') => 
  generateStructuredPDF(data, PAGE_CONFIGS.bookings, filename);

export const generateSchedulesPDF = (data, filename = 'schedules-report') => 
  generateStructuredPDF(data, PAGE_CONFIGS.schedules, filename);

export const generateTapHistoryPDF = (data, filename = 'tap-history-report') => 
  generateStructuredPDF(data, PAGE_CONFIGS.tapHistory, filename);

export const generateAuditTrailsPDF = (data, filename = 'audit-trails-report') => 
  generateStructuredPDF(data, PAGE_CONFIGS.auditTrails, filename);

export const generateUsersPDF = (data, filename = 'users-report', customTitle = null) => {
  const config = customTitle ? { ...PAGE_CONFIGS.users, title: customTitle } : PAGE_CONFIGS.users;
  return generateStructuredPDF(data, config, filename);
};

export const generateTicketClerksPDF = (data, filename = 'ticket-clerks-report') => 
  generateStructuredPDF(data, PAGE_CONFIGS.ticketClerks, filename);

export const generateAdminsPDF = (data, filename = 'admins-report') => 
  generateStructuredPDF(data, PAGE_CONFIGS.admins, filename);

export const generateCustomPDF = (data, configKey, filename) => 
  generateStructuredPDF(data, PAGE_CONFIGS[configKey], filename);

export const generateTablePDF = async (tableSelector, filename, title) => {
  try {
    toast.loading('Generating PDF...');
    const tableElement = document.querySelector(tableSelector);
    if (!tableElement) { toast.error('Table not found'); return; }
    
    const canvas = await html2canvas(tableElement, { scale: 2, useCORS: true, logging: false });
    const pdf = new jsPDF('p', 'mm', 'a4');
    addHeader(pdf, title);
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190, pageHeight = 290;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight, position = 40;
    
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i, totalPages);
    }
    
    pdf.save(`${filename}.pdf`);
    toast.dismiss();
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};

export const generateMultiTablePDF = async (tables, filename, mainTitle) => {
  try {
    toast.loading('Generating PDF...');
    
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    addHeader(pdf, mainTitle);

    let currentY = 40;

    for (let i = 0; i < tables.length; i++) {
      const { selector, title } = tables[i];
      const tableElement = document.querySelector(selector);
      
      if (!tableElement) continue;

      if (i > 0) {
        pdf.addPage();
        currentY = 40;
      }
      
      addHeader(pdf, title);

      const canvas = await html2canvas(tableElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 20;
    }
    
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i, totalPages);
    }
    
    pdf.save(`${filename}.pdf`);
    toast.dismiss();
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};