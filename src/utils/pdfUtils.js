import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import logoBlue from '../assets/imgs/logoblue.png';
import ppaLogo from '../assets/imgs/ppa_logo.png';

const COLORS = {
  primary: [21, 94, 117], 
  tableHeader: [21, 94, 117], 
  secondary: [100, 116, 139], 
  accent: [37, 99, 235],
  success: [5, 150, 105], 
  danger: [220, 38, 38], 
  background: [255, 255, 255], 
  border: [203, 213, 225], 
  text: [30, 41, 59], 
  headerBg: [255, 255, 255], 
  lightGray: [248, 250, 252]
};

const FONTS = {
  title: { size: 16, weight: 'bold' }, subtitle: { size: 12, weight: 'normal' }, 
  heading: { size: 11, weight: 'bold' }, body: { size: 10, weight: 'normal' }, 
  small: { size: 9, weight: 'normal' }, tiny: { size: 7, weight: 'normal' } 
};

// Generate reference code
const generateReferenceCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PPA-${year}${month}${day}-${random}`;
};

const addHeader = (pdf) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const now = new Date();
  const referenceCode = generateReferenceCode();
  
  pdf.setTextColor(...COLORS.text);
  pdf.setFontSize(7); 
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${now.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })}`, 15, 12); 
  
  const refText = `Reference: ${referenceCode}`;
  const refTextWidth = pdf.getStringUnitWidth(refText) * 7 / pdf.internal.scaleFactor;
  pdf.text(refText, pageWidth - 15 - refTextWidth, 12); 
  
  pdf.setFillColor(245, 245, 245);
  pdf.rect(15, 16, pageWidth - 30, 30, 'F'); 

  try {
    if (logoBlue) {
      pdf.addImage(logoBlue, 'PNG', 20, 22, 20, 20); 
    }
    if (ppaLogo) {
      pdf.addImage(ppaLogo, 'PNG', 45, 22, 20, 20);
    }
  } catch (error) {
    console.warn('Could not load logos:', error);
  }
  
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  const ppaTitle = 'PHILIPPINE PORTS AUTHORITY';
  const ppaTitleWidth = pdf.getStringUnitWidth(ppaTitle) * 10 / pdf.internal.scaleFactor;
  pdf.text(ppaTitle, pageWidth - 20 - ppaTitleWidth, 25); 
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const addr1 = 'PPA Corporate Bldg.';
  const addr1Width = pdf.getStringUnitWidth(addr1) * 8 / pdf.internal.scaleFactor;
  pdf.text(addr1, pageWidth - 20 - addr1Width, 30); 
  
  const addr2 = 'Barangay Talao Talao, Port Area';
  const addr2Width = pdf.getStringUnitWidth(addr2) * 8 / pdf.internal.scaleFactor;
  pdf.text(addr2, pageWidth - 20 - addr2Width, 35); 
  
  const addr3 = 'Lucena City Quezon Province 4301 Philippines';
  const addr3Width = pdf.getStringUnitWidth(addr3) * 8 / pdf.internal.scaleFactor;
  pdf.text(addr3, pageWidth - 20 - addr3Width, 40); 
  
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(1);
  pdf.line(15, 50, pageWidth - 15, 50);
  
  pdf.setTextColor(...COLORS.text);
};

const addTitle = (pdf, title, subtitle = '') => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = 58;
  
  if (title) {
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(FONTS.title.size);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 15, currentY);
    currentY += 8; // 
    
    if (subtitle) {
      pdf.setFontSize(FONTS.subtitle.size);
      pdf.setFont('helvetica', 'normal');
      pdf.text(subtitle, 15, currentY); 
      currentY += 6; 
    }
  }
  
  return currentY + 3; 
};

const addFooter = (pdf, pageNumber, totalPages) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
  
  pdf.setTextColor(...COLORS.secondary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text('Philippine Ports Authority - Lucena City', 20, pageHeight - 15);
  pdf.text('Official Document - EcBarko System', 20, pageHeight - 10);
  
  const confidentialText = 'CONFIDENTIAL - FOR OFFICIAL USE ONLY';
  const confidentialWidth = pdf.getStringUnitWidth(confidentialText) * 8 / pdf.internal.scaleFactor;
  pdf.text(confidentialText, (pageWidth - confidentialWidth) / 2, pageHeight - 12);
  
  const pageText = `Page ${pageNumber} of ${totalPages}`;
  const pageTextWidth = pdf.getStringUnitWidth(pageText) * 8 / pdf.internal.scaleFactor;
  pdf.text(pageText, pageWidth - 20 - pageTextWidth, pageHeight - 15);
  
  const now = new Date();
  const dateTimeText = now.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const dateTextWidth = pdf.getStringUnitWidth(dateTimeText) * 8 / pdf.internal.scaleFactor;
  pdf.text(dateTimeText, pageWidth - 20 - dateTextWidth, pageHeight - 10);
};

const addSummarySection = (pdf, title, summaryText, statusCards, startY = 58) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = startY;
  
  pdf.setFillColor(...COLORS.background);
  pdf.rect(15, currentY, pageWidth - 30, 6, 'F'); 
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(FONTS.heading.size);
  pdf.setFont('helvetica', FONTS.heading.weight);
  pdf.text('Executive Summary', 20, currentY + 4);
  currentY += 12;
  
  if (summaryText) {
    pdf.setTextColor(...COLORS.text);
    pdf.setFontSize(FONTS.body.size);
    pdf.setFont('helvetica', FONTS.body.weight);
    pdf.text(summaryText, 20, currentY); 
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
      
      pdf.setTextColor(...COLORS.secondary);
      pdf.setFontSize(FONTS.small.size);
      pdf.text(card.title, x + 10, y + 15);
      
      pdf.setTextColor(...COLORS.primary);
      pdf.setFontSize(FONTS.title.size);
      pdf.setFont('helvetica', 'bold');
      pdf.text(card.value.toString(), x + 10, y + 28);
    });
  }
  
  return currentY + 50;
};

const generateProfessionalFilename = (reportType, additionalInfo = '') => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS format
  
  let baseFilename = '';
  
  switch (reportType.toLowerCase()) {
    case 'dashboard':
      baseFilename = 'PPA_EcBarko_Dashboard_Analytics';
      break;
    case 'users':
      baseFilename = 'PPA_EcBarko_User_Management_Report';
      break;
    case 'cards':
      baseFilename = 'PPA_EcBarko_Card_Management_Report';
      break;
    case 'taphist':
    case 'tap_history':
      baseFilename = 'PPA_EcBarko_Tap_History_Report';
      break;
    default:
      baseFilename = 'PPA_EcBarko_System_Report';
  }
  
  if (additionalInfo) {
    baseFilename += `_${additionalInfo.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
  
  return `${baseFilename}_${dateStr}_${timeStr}`;
};

const COLUMN_CONFIGS = {
  fareCategories: [
    { field: 'type', label: 'Type' },
    { field: 'description', label: 'Description' },
    { field: 'price', label: 'Price (₱)' },
    { field: 'ageRange', label: 'Age Range' },
    { field: 'discount', label: 'Discount (₱)' },
    { field: 'discountPercentage', label: 'Discount %' },
    { field: 'requirements', label: 'Requirements' },
  ],
  users: [
    { field: 'userId', label: 'User Id' },
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
    { field: 'phone', label: 'Phone' },
    { field: 'status', label: 'Status' },
    { field: 'lastActive', label: 'Last Active' },
  ],
  ecbarko: [
    { field: 'userId', label: 'User Id' },
    { field: 'name', label: 'Account' },
    { field: 'cardNumber', label: 'Card Number' },
    { field: 'balance', label: 'Balance' },
    { field: 'status', label: 'Status' },
    { field: 'lastActive', label: 'Last Active' },
  ],
  schedule: [
    { field: 'schedcde', label: 'Code', wrap: true },
    { field: 'date', label: 'Date', wrap: true },
    { field: 'departureTime', label: 'Departure Time', wrap: true },
    { field: 'arrivalTime', label: 'Arrival Time', wrap: true },
    { field: 'arrivalDate', label: 'Arrival Date', wrap: true },
    { field: 'from', label: 'From', wrap: true },
    { field: 'to', label: 'To', wrap: true },
    { field: 'shippingLines', label: 'Shipping Lines', wrap: true },
    { field: 'passengerCapacity', label: 'Passenger Seats', wrap: true },
    { field: 'vehicleCapacity', label: 'Vehicle Slots', wrap: true },
  ],
  tapHistory: [
    { field: 'user', label: 'User' },
    { field: 'cardNo', label: 'Card No' },
    { field: 'vehicleType', label: 'Vehicle Type' },
    { field: 'dateTime', label: 'Date & Time' },
    { field: 'status', label: 'Status' },
    { field: 'payment', label: 'Payment' },
    { field: 'route', label: 'Route' },
  ],
  ticketClerk: [
    { field: 'name', label: 'Name' },
    { field: 'clerkId', label: 'Clerk ID' },
    { field: 'email', label: 'Email' },
    { field: 'status', label: 'Status' },
  ],
  admin: [
    { field: 'name', label: 'Admin Name' },
    { field: 'adminId', label: 'Admin ID' },
    { field: 'email', label: 'Email' },
    { field: 'role', label: 'Role' },
    { field: 'status', label: 'Status' },
  ],
  auditTrail: [
    { field: 'date', label: 'Date' },
    { field: 'userID', label: 'User ID' },
    { field: 'name', label: 'Name' },
    { field: 'action', label: 'Action', wrap: true },
  ],
  vehicles: [
    { field: 'cardNumber', label: 'Card Number' },
    { field: 'userId', label: 'User ID' },
    { field: 'userName', label: 'User Name' },
    { field: 'vehicleCount', label: 'Vehicle Count' },
    { field: 'vehicleDetails', label: 'Vehicle Details', wrap: true },
    { field: 'registeredBy', label: 'Registered By' },
    { field: 'createdAt', label: 'Registration Date' },
  ],
};

const addTableData = (pdf, headers, data, startY = 58) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = startY;

  if (!Array.isArray(headers)) {
    console.error('Invalid headers provided to addTableData. Expected an array but received:', headers);
    pdf.setTextColor(...COLORS.danger);
    pdf.setFontSize(10);
    pdf.text('Error: Invalid column configuration', 15, currentY + 10);
    return currentY;
  }

  if (!data || !Array.isArray(data)) {
    console.warn('Invalid data provided to addTableData');
    return currentY;
  }

  const availableWidth = pageWidth - 30;
  const totalColumns = headers.length;
  const adjustedColumnWidths = headers.map(header => header.width || availableWidth / totalColumns);

  const tableFontSize = totalColumns > 6 ? 7 : totalColumns > 4 ? 8 : 9;

  if (data.length === 0) {
    pdf.setFillColor(...COLORS.lightGray);
    pdf.rect(15, currentY, pageWidth - 30, 20, 'F');
    pdf.setTextColor(...COLORS.secondary);
    pdf.setFontSize(tableFontSize);
    pdf.setFont('helvetica', 'italic');
    pdf.text('No data available for this report', 30, currentY + 12);
    return;
  }

  let startX = 15;
  const headerHeight = 12;

  pdf.setFillColor(...COLORS.tableHeader);
  pdf.rect(startX, currentY, pageWidth - 30, headerHeight, 'F');
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.rect(startX, currentY, pageWidth - 30, headerHeight, 'D');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(tableFontSize);
  pdf.setFont('helvetica', 'bold');

  headers.forEach((header, index) => {
    const columnWidth = adjustedColumnWidths[index];
    const textX = startX + (columnWidth - pdf.getStringUnitWidth(header.label) * tableFontSize / pdf.internal.scaleFactor) / 2;
    pdf.text(header.label, Math.max(startX + 1, textX), currentY + 8);
    startX += columnWidth;
  });
  currentY += headerHeight;

  data.forEach((item, index) => {
    if (currentY > pageHeight - 40) {
      pdf.addPage();
      addHeader(pdf);
      currentY = addTitle(pdf);
      startX = 15;
      pdf.setFillColor(...COLORS.tableHeader);
      pdf.rect(startX, currentY, pageWidth - 30, headerHeight, 'F');
      pdf.setDrawColor(...COLORS.border);
      pdf.rect(startX, currentY, pageWidth - 30, headerHeight, 'D');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(tableFontSize);
      pdf.setFont('helvetica', 'bold');
      headers.forEach((header, hIndex) => {
        const columnWidth = adjustedColumnWidths[hIndex];
        const textX = startX + (columnWidth - pdf.getStringUnitWidth(header.label) * tableFontSize / pdf.internal.scaleFactor) / 2;
        pdf.text(header.label, Math.max(startX + 1, textX), currentY + 8);
        startX += columnWidth;
      });
      currentY += headerHeight;
    }

    startX = 15;

    let maxLines = 1;
    const columnTexts = [];
    
    headers.forEach((header, colIndex) => {
      const columnWidth = adjustedColumnWidths[colIndex];
      let value = item[header.field] || 'N/A';
      
      if (header.formatter) {
        try {
          value = header.formatter(value, item);
        } catch (err) {
          console.warn('Formatter error for field', header.field, err);
          value = 'Error';
        }
      }
      
      pdf.setFontSize(tableFontSize);
      pdf.setFont('helvetica', 'normal');
      
      const textLines = pdf.splitTextToSize(value.toString(), columnWidth - 2);
      columnTexts.push({
        lines: textLines,
        header: header,
        colIndex: colIndex
      });
      
      maxLines = Math.max(maxLines, textLines.length);
    });
    
    const lineHeight = 4;
    const basePadding = 6;
    const dynamicRowHeight = Math.max(9, basePadding + (maxLines * lineHeight));
    
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.lightGray);
      pdf.rect(15, currentY, pageWidth - 30, dynamicRowHeight, 'F');
    }
    
    pdf.setDrawColor(...COLORS.border);
    pdf.setLineWidth(0.2);
    pdf.rect(15, currentY, pageWidth - 30, dynamicRowHeight, 'D');
    
    columnTexts.forEach((columnData) => {
      const columnWidth = adjustedColumnWidths[columnData.colIndex];
      
      if (columnData.header.color) {
        try {
          const value = item[columnData.header.field] || 'N/A';
          pdf.setTextColor(...columnData.header.color(value, item));
        } catch (err) {
          console.warn('Color function error for field', columnData.header.field, err);
          pdf.setTextColor(...COLORS.text);
        }
      } else {
        pdf.setTextColor(...COLORS.text);
      }
      
      pdf.setFontSize(tableFontSize);
      pdf.setFont('helvetica', 'normal');
      
      columnData.lines.forEach((line, lineIndex) => {
        pdf.text(line, startX + 1, currentY + 6 + lineIndex * lineHeight);
      });
      
      if (columnData.colIndex < headers.length - 1) {
        pdf.setDrawColor(...COLORS.border);
        pdf.line(startX + columnWidth, currentY, startX + columnWidth, currentY + dynamicRowHeight);
      }
      
      startX += columnWidth;
    });
    
    currentY += dynamicRowHeight;
  });
};

export const generateStructuredPDF = async (data, config, filename) => {
  try {
    if (!data || !config) {
      console.error('Missing data or config for PDF generation:', { data: !!data, config: !!config });
      toast.error('Invalid data provided for PDF generation');
      return;
    }

    if (!Array.isArray(data)) {
      console.error('Data must be an array for PDF generation');
      toast.error('Invalid data format for PDF generation');
      return;
    }

    let columns = [];
    if (Array.isArray(config.columns)) {
      columns = config.columns;
    } else if (config.type && COLUMN_CONFIGS[config.type]) {
      columns = COLUMN_CONFIGS[config.type];
    } else if (data.length > 0) {
      const firstItem = data[0];
      columns = Object.keys(firstItem).map(key => ({
        field: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
      }));
    }
    
    if (columns.length === 0) {
      console.error('Invalid or missing column configuration for type:', config.type);
      toast.error('Invalid or missing column configuration for PDF generation');
      return;
    }

    toast.loading('Generating PDF...');
    const pdf = new jsPDF('p', 'mm', 'legal');
    addHeader(pdf);
    let currentY = addTitle(pdf, config.title || 'Report', config.subtitle || '');
    
    const summaryText = config.summaryStats ? config.summaryStats(data) : null;
    const statusCards = config.statusCards ? config.statusCards(data) : null;
    addSummarySection(pdf, config.title || 'Report', summaryText, statusCards, currentY);
    
    pdf.addPage();
    addHeader(pdf);
    currentY = addTitle(pdf, config.tableTitle || config.title || 'Data Report', 'Complete Data Listing');
    addTableData(pdf, columns, data, currentY);
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i, totalPages);
    }
    
    const professionalFilename = generateProfessionalFilename('structured', config.title);
    pdf.save(`${professionalFilename}.pdf`);
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
    if (!dashboardData) {
      console.error('No dashboard data provided');
      toast.error('No data available for PDF generation');
      return;
    }
    
    toast.loading('Generating PDF...');
    const pdf = new jsPDF('p', 'mm', 'legal'); // Portrait orientation
    addHeader(pdf);
    let currentY = addTitle(pdf, title, 'Comprehensive Dashboard Analytics Report');
    
    // Executive Summary Page
    const pageWidth = pdf.internal.pageSize.getWidth();    // Dashboard Overview Section
    pdf.setFillColor(...COLORS.lightGray);
    pdf.rect(20, currentY, pageWidth - 40, 8, 'F');
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(FONTS.heading.size);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EXECUTIVE DASHBOARD SUMMARY', 25, currentY + 6);
    currentY += 20;
    
    // Key Performance Indicators
    const statusCards = [
      { 
        title: 'Total Registered Users', 
        value: dashboardData.userStats?.total || 0, 
        color: COLORS.primary, 
        description: `Active user base with ${dashboardData.userPercentageChange?.toFixed(1) || 0}% growth`
      },
      { 
        title: 'Active EcBarko Cards', 
        value: dashboardData.cardStats?.active || 0, 
        color: COLORS.success, 
        description: `Card utilization showing ${dashboardData.cardPercentageChange?.toFixed(1) || 0}% increase`
      },
      { 
        title: 'Monthly Revenue', 
        value: `₱${(dashboardData.revenueCurrentMonth || 0).toLocaleString()}`, 
        color: (dashboardData.revenueChangePercent || 0) >= 0 ? COLORS.success : COLORS.danger, 
        description: `Revenue ${(dashboardData.revenueChangePercent || 0) >= 0 ? 'increased' : 'decreased'} by ${Math.abs(dashboardData.revenueChangePercent || 0).toFixed(1)}%`
      }
    ];

    // Draw KPI cards
    const cardWidth = (pageWidth - 60) / 3;
    statusCards.forEach((card, index) => {
      const x = 20 + index * (cardWidth + 10);
      const y = currentY;
      
      // Card background
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(...COLORS.border);
      pdf.setLineWidth(1);
      pdf.rect(x, y, cardWidth, 45, 'FD');
      
      // Card header with title only
      pdf.setTextColor(...card.color);
      pdf.setFontSize(FONTS.body.size);
      pdf.setFont('helvetica', 'bold');
      pdf.text(card.title, x + 5, y + 12);
      
      // Main value
      pdf.setTextColor(...COLORS.text);
      pdf.setFontSize(FONTS.title.size);
      pdf.setFont('helvetica', 'bold');
      pdf.text(card.value.toString(), x + 5, y + 25);
      
      // Description
      pdf.setFontSize(FONTS.small.size);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...COLORS.secondary);
      const descLines = pdf.splitTextToSize(card.description, cardWidth - 10);
      pdf.text(descLines, x + 5, y + 33);
    });
    
    currentY += 65;

    // Performance Analysis Section
    pdf.setFillColor(...COLORS.lightGray);
    pdf.rect(15, currentY, pageWidth - 30, 8, 'F'); // Reduced margins
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(FONTS.heading.size);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PERFORMANCE ANALYSIS & INSIGHTS', 20, currentY + 6); // Reduced margin
    currentY += 20;
    
    // Analysis text
    pdf.setTextColor(...COLORS.text);
    pdf.setFontSize(FONTS.body.size);
    pdf.setFont('helvetica', 'normal');
    
    const analysisText = [
      `System Overview: The EcBarko digital ferry system continues to demonstrate strong performance metrics across all key areas.`,
      `User Growth: With ${dashboardData.userStats?.total || 0} total users, the platform shows ${dashboardData.userPercentageChange?.toFixed(1) || 0}% growth, indicating healthy adoption rates.`,
      `Card Utilization: ${dashboardData.cardStats?.active || 0} active EcBarko cards represent strong user engagement with ${dashboardData.cardPercentageChange?.toFixed(1) || 0}% month-over-month growth.`,
      `Revenue Performance: Current monthly revenue of ₱${(dashboardData.revenueCurrentMonth || 0).toLocaleString()} reflects ${(dashboardData.revenueChangePercent || 0) >= 0 ? 'positive' : 'negative'} growth of ${Math.abs(dashboardData.revenueChangePercent || 0).toFixed(1)}%.`
    ];
    
    analysisText.forEach((text, index) => {
      // Ensure proper text rendering without character spacing issues
      const cleanText = text.replace(/\s+/g, ' ').trim();
      const lines = pdf.splitTextToSize(cleanText, pageWidth - 40); // Reduced from 60 to 40 for better margins
      
      pdf.setTextColor(...COLORS.text);
      pdf.setFontSize(FONTS.body.size);
      pdf.setFont('helvetica', 'normal');
      
      lines.forEach((line, lineIndex) => {
        pdf.text(line, 20, currentY + (index * 12) + (lineIndex * 4)); // Reduced from 30 to 20
      });
    });
    
    const chartConfigs = [
      {
        selector: '.totalUsers .recharts-wrapper',
        title: 'USER REGISTRATION TRENDS',
        description: 'User Growth Analytics & Registration Patterns',
        insights: [
          `Total registered users: ${dashboardData.userStats?.total || 0}`,
          `Growth rate: ${dashboardData.userPercentageChange?.toFixed(1) || 0}% compared to previous period`,
          `New users this month: ${dashboardData.userStats?.newThisMonth || 0}`,
          `This chart demonstrates the platform's user acquisition trends and adoption rates over time.`
        ]
      },
      {
        selector: '.active-cards .recharts-wrapper',
        title: 'ECBARKO CARD ACTIVATION METRICS',
        description: 'Card Usage & Activation Performance',
        insights: [
          `Total active cards: ${dashboardData.cardStats?.active || 0}`,
          `Activation growth: ${dashboardData.cardPercentageChange?.toFixed(1) || 0}% month-over-month`,
          `New activations: ${dashboardData.cardStats?.newThisMonth || 0}`,
          `Card activation trends indicate user engagement levels and system adoption success.`
        ]
      },
      {
        selector: '.total-revenue .recharts-wrapper',
        title: 'MONTHLY BOOKING PAYMENTS PERFORMANCE',
        description: 'Revenue Analysis & Financial Performance',
        insights: [
          `Current month revenue: ₱${(dashboardData.revenueCurrentMonth || 0).toLocaleString()}`,
          `Revenue change: ${(dashboardData.revenueChangePercent || 0) >= 0 ? '+' : ''}${(dashboardData.revenueChangePercent || 0).toFixed(1)}%`,
          `Previous month: ₱${(dashboardData.revenuePreviousMonth || 0).toLocaleString()}`,
          `Payment trends reflect overall system health and user transaction patterns.`
        ]
      }
    ];

    // Generate detailed chart pages
    for (let i = 0; i < chartConfigs.length; i++) {
      const config = chartConfigs[i];
      const chartElement = document.querySelector(config.selector);
      
      pdf.addPage();
      addHeader(pdf);
      let currentY = addTitle(pdf, config.title, config.description);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Chart section title
      pdf.setFillColor(...COLORS.primary);
      pdf.rect(20, currentY, pageWidth - 40, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(FONTS.body.size);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VISUAL ANALYTICS', 25, currentY + 7);
      currentY += 20;

      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            letterRendering: true,
            width: chartElement.offsetWidth,
            height: chartElement.offsetHeight
          });

          const imgData = canvas.toDataURL('image/png');
          
          // Calculate dimensions maintaining aspect ratio
          const originalAspectRatio = canvas.width / canvas.height;
          const maxWidth = pageWidth - 40; // Leave margins
          const maxHeight = 250; // Fixed height to prevent compression
          
          let chartWidth = maxWidth;
          let chartHeight = chartWidth / originalAspectRatio;
          
          // If height exceeds max, adjust based on height
          if (chartHeight > maxHeight) {
            chartHeight = maxHeight;
            chartWidth = chartHeight * originalAspectRatio;
          }
          
          const chartX = (pageWidth - chartWidth) / 2;

          pdf.addImage(imgData, 'PNG', chartX, currentY, chartWidth, chartHeight);
          currentY += chartHeight + 10;

        } catch (error) {
          console.error(`Failed to capture chart ${config.title}:`, error);
          pdf.setFillColor(...COLORS.lightGray);
          pdf.rect(20, currentY, pageWidth - 40, 60, 'F');
          pdf.setTextColor(...COLORS.secondary);
          pdf.setFontSize(FONTS.body.size);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Chart visualization temporarily unavailable', 30, currentY + 35);
          currentY += 75;
        }
      } else {
        pdf.setFillColor(...COLORS.lightGray);
        pdf.rect(20, currentY, pageWidth - 40, 60, 'F');
        pdf.setTextColor(...COLORS.secondary);
        pdf.setFontSize(FONTS.body.size);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Chart data not found', 30, currentY + 35);
        currentY += 75;
      }

      // Key Insights Section
      pdf.setFillColor(...COLORS.lightGray);
      pdf.rect(20, currentY, pageWidth - 40, 8, 'F');
      pdf.setTextColor(...COLORS.primary);
      pdf.setFontSize(FONTS.heading.size);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KEY INSIGHTS & ANALYSIS', 25, currentY + 6);
      currentY += 18;

      // Insights content
      config.insights.forEach((insight, index) => {
        pdf.setTextColor(...COLORS.text);
        pdf.setFontSize(FONTS.body.size);
        pdf.setFont('helvetica', 'normal');
        
        if (index === 0 || index === 1 || index === 2) {
          pdf.setFont('helvetica', 'bold');
        }
        
        const bulletPoint = index < 3 ? '• ' : '→ ';
        const lines = pdf.splitTextToSize(bulletPoint + insight, pageWidth - 60);
        pdf.text(lines, 30, currentY);
        currentY += lines.length * 6 + 3;
      });
    }

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i, totalPages);
    }

    const professionalFilename = generateProfessionalFilename('dashboard');
    pdf.save(`${professionalFilename}.pdf`);
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
  fareCategories: {
    title: 'Passenger Fare Management',
    subtitle: 'Passenger Fare Report',
    tableTitle: 'Passenger Fare Directory',
    summaryStats: (data) => {
      const active = data.filter(f => f.isActive).length;
      const inactive = data.filter(f => !f.isActive).length;
      const avgPrice = data.length > 0 ? (data.reduce((sum, f) => sum + (parseFloat(f.price) || 0), 0) / data.length).toFixed(2) : 0;
      return `Total: ${data.length} | Active: ${active} | Inactive: ${inactive} | Avg Price: ₱${avgPrice}`;
    },
    statusCards: (data) => [
      { title: 'Total Fares', value: data.length, color: COLORS.accent },
      { title: 'Active Fares', value: data.filter(f => f.isActive).length, color: COLORS.success },
      { title: 'Inactive Fares', value: data.filter(f => !f.isActive).length, color: COLORS.danger }
    ],
    columns: COLUMN_CONFIGS.fareCategories,
    columnWidths: [30, 40, 30, 30, 30, 30, 40]
  },

  ecBarkoCards: {
    title: 'EcBarko Card Management',
    subtitle: 'Card Management Report',
    tableTitle: 'Card Directory',
    summaryStats: (data) => {
      const active = data.filter(c => c.status === 'active').length;
      const deactivated = data.filter(c => c.status === 'deactivated').length;
      return `Total: ${data.length} | Active: ${active} | Deactivated: ${deactivated}`;
    },
    statusCards: (data) => [
      { title: 'Active Cards', value: data.filter(c => c.status === 'active').length, color: COLORS.success },
      { title: 'Deactivated', value: data.filter(c => c.status === 'deactivated').length, color: COLORS.danger }
    ],
    columns: COLUMN_CONFIGS.ecbarko,
    columnWidths: [30, 40, 50, 40, 30, 40]
  },
  
  bookings: {
    title: 'Bookings Management',
    subtitle: 'Booking Records Report',
    summaryStats: (data) => {
      const active = data.filter(b => b.status === 'active').length;
      return `Total: ${data.length} | Active: ${active} | Cancelled: ${data.length - active}`;
    },
    statusCards: (data) => [
      { title: 'Active Bookings', value: data.filter(b => b.status === 'active').length, color: COLORS.success },
      { title: 'Cancelled', value: data.filter(b => b.status === 'cancelled').length, color: COLORS.danger }
    ],
    columns: {
      bookingReference: { label: 'Booking ID', formatter: (val, item) => item.bookingReference || item.bookingId || 'N/A' },
      bookingDate: { label: 'Booking Date', formatter: (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '' },
      userID: { label: 'User ID', formatter: (val, item) => item.userID || item.userId || 'N/A' },
      departureLocation: { label: 'Departure' },
      arrivalLocation: { label: 'Arrival' },
      departDate: { label: 'Depart Date', formatter: formatDate },
      departTime: { label: 'Depart Time', formatter: formatTime12Hour },
      totalFare: { label: 'Payment', formatter: (fare) => `₱${fare}` },
      status: { label: 'Status', color: (status) => status === 'active' ? COLORS.success : COLORS.danger }
    },
    columnWidths: [35, 40, 30, 35, 35, 35, 30, 40, 25]
  },
  
  schedules: {
    title: 'Schedule Management',
    subtitle: 'Ferry Schedule Report',
    summaryStats: (data) => `Total: ${data.length} | Available Seats: ${data.reduce((sum, s) => sum + ((s.passengerCapacity || 0) - (s.passengerBooked || 0)), 0)}`,
    statusCards: (data) => [
      { title: 'Schedules', value: data.length, color: COLORS.accent },
      { title: 'Available Seats', value: data.reduce((sum, s) => sum + ((s.passengerCapacity || 0) - (s.passengerBooked || 0)), 0), color: COLORS.success }
    ],
    columns: COLUMN_CONFIGS.schedule,
    columnWidths: [25, 30, 35, 35, 35, 35, 35, 50, 35, 35]
  },
  
  tapHistory: {
    title: 'Tap History Records',
    subtitle: 'Card Tap Activity Report',
    summaryStats: (data) => {
      const allowed = data.filter(h => h.hasActiveBooking).length;
      return `Total: ${data.length} | Allowed: ${allowed} | Denied: ${data.length - allowed}`;
    },
    statusCards: (data) => [
      { title: 'Total Taps', value: data.length, color: COLORS.accent },
      { title: 'Entry Allowed', value: data.filter(h => h.hasActiveBooking).length, color: COLORS.success }
    ],
    columns: COLUMN_CONFIGS.tapHistory,
    columnWidths: [40, 35, 30, 50, 30, 40, 35]
  },
  
  auditTrails: {
    title: 'Audit Trails',
    subtitle: 'System Activity Report',
    summaryStats: (data) => `Total Records: ${data.length} | Users: ${new Set(data.map(a => a.userID)).size}`,
    statusCards: (data) => [
      { title: 'Records', value: data.length, color: COLORS.accent },
      { title: 'Unique Users', value: new Set(data.map(a => a.userID)).size, color: COLORS.success }
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
      { title: 'Total Users', value: data.length, color: COLORS.accent },
      { title: 'Active Users', value: data.filter(u => u.status === 'active').length, color: COLORS.success },
      { title: 'Deactivated', value: data.filter(u => u.status === 'deactivated').length, color: COLORS.danger }
    ],
    columns: COLUMN_CONFIGS.users,
    columnWidths: [40, 60, 70, 50, 30, 50]
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
      { title: 'Total Clerks', value: data.length, color: COLORS.accent },
      { title: 'Active Clerks', value: data.filter(tc => tc.status === 'active').length, color: COLORS.success },
      { title: 'Deactivated', value: data.filter(tc => tc.status === 'deactivated').length, color: COLORS.danger }
    ],
    columns: COLUMN_CONFIGS.ticketClerk,
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
      { title: 'Total Admins', value: data.length, color: COLORS.accent },
      { title: 'Active Admins', value: data.filter(a => a.status === 'active').length, color: COLORS.success },
      { title: 'Deactivated', value: data.filter(a => a.status === 'deactivated').length, color: COLORS.danger }
    ],
    columns: COLUMN_CONFIGS.admin,
    columnWidths: [60, 50, 80, 40, 40]
  },

  auditTrails: {
    title: 'Audit Trails',
    subtitle: 'System Activity Report',
    summaryStats: (data) => `Total Records: ${data.length} | Users: ${new Set(data.map(a => a.userID || a.userId)).size}`,
    statusCards: (data) => [
      { title: 'Records', value: data.length, color: COLORS.accent },
      { title: 'Unique Users', value: new Set(data.map(a => a.userID || a.userId)).size, color: COLORS.success }
    ],
    columns: COLUMN_CONFIGS.auditTrail,
    columnWidths: [50, 60, 60, 120]
  },

  vehicles: {
    title: 'Vehicle Management',
    subtitle: 'Registered Vehicles Report',
    tableTitle: 'Vehicle Directory - Grouped by Card',
    summaryStats: (data) => {
      const totalVehicles = data.reduce((sum, item) => {
        // Extract number from vehicleCount string (e.g., "2 vehicles" -> 2)
        const count = parseInt(item.vehicleCount.match(/\d+/)?.[0] || '0');
        return sum + count;
      }, 0);
      const uniqueUsers = new Set(data.map(item => item.userId)).size;
      return `Total: ${data.length} card groups | Vehicles: ${totalVehicles} | Users: ${uniqueUsers}`;
    },
    statusCards: (data) => [
      { title: 'Card Groups', value: data.length, color: COLORS.accent },
      { title: 'Total Vehicles', value: data.reduce((sum, item) => {
        const count = parseInt(item.vehicleCount.match(/\d+/)?.[0] || '0');
        return sum + count;
      }, 0), color: COLORS.success },
      { title: 'Unique Users', value: new Set(data.map(item => item.userId)).size, color: COLORS.primary }
    ],
    columns: COLUMN_CONFIGS.vehicles,
    columnWidths: [40, 30, 50, 30, 80, 50, 40]
  }
};

export const generateFareCategoriesPDF = (data, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS.fareCategories, filename || generateProfessionalFilename('fare_categories'));

export const generateEcBarkoCardsPDF = (data, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS.ecBarkoCards, filename || generateProfessionalFilename('cards'));

export const generateBookingsPDF = (data, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS.bookings, filename || generateProfessionalFilename('bookings'));

export const generateSchedulesPDF = (data, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS.schedules, filename || generateProfessionalFilename('schedules'));

export const generateTapHistoryPDF = (data, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS.tapHistory, filename || generateProfessionalFilename('tap_history'));

export const generateAuditTrailsPDF = (data, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS.auditTrails, filename || generateProfessionalFilename('audit_trails'));

export const generateUsersPDF = (data, filename = null, customTitle = null) => {
  const config = customTitle ? { ...PAGE_CONFIGS.users, title: customTitle } : PAGE_CONFIGS.users;
  return generateStructuredPDF(data, config, filename || generateProfessionalFilename('users'));
};

export const generateVehiclesPDF = (data, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS.vehicles, filename || generateProfessionalFilename('vehicles'));

export const generateTicketClerksPDF = (data, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS.ticketClerks, filename || generateProfessionalFilename('ticket_clerks'));

export const generateAdminsPDF = (data, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS.admins, filename || generateProfessionalFilename('admins'));

export const generateCustomPDF = (data, configKey, filename = null) => 
  generateStructuredPDF(data, PAGE_CONFIGS[configKey], filename || generateProfessionalFilename('custom', configKey));

export const generateTablePDF = async (tableSelector, filename, title) => {
  try {
    toast.loading('Generating PDF...');
    const tableElement = document.querySelector(tableSelector);
    if (!tableElement) { 
      toast.error('Table not found'); 
      return; 
    }
    
    const canvas = await html2canvas(tableElement, { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const pdf = new jsPDF('p', 'mm', 'legal'); // Portrait orientation
    addHeader(pdf);
    const currentY = addTitle(pdf, title, 'Data Table Export');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL('image/png');
    
    const imgWidth = pageWidth - 40; // Leave margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = currentY;
    
    pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - position - 30); // Account for header and footer
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      addHeader(pdf);
      pdf.addImage(imgData, 'PNG', 20, 85, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 115); // Account for header and footer on continuation pages
    }
    
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i, totalPages);
    }
    
    const professionalFilename = generateProfessionalFilename('table', title);
    pdf.save(`${professionalFilename}.pdf`);
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
    
    const pdf = new jsPDF('p', 'mm', 'legal'); // Portrait orientation
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    addHeader(pdf);
    let currentY = addTitle(pdf, mainTitle, 'Multi-Table Data Export');
    pdf.setFillColor(...COLORS.lightGray);
    pdf.rect(20, currentY, pageWidth - 40, 8, 'F');
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(FONTS.heading.size);
    pdf.setFont('helvetica', 'bold');
    pdf.text('REPORT CONTENTS', 25, currentY + 6);
    currentY += 20;
    
    // Table of contents
    pdf.setTextColor(...COLORS.text);
    pdf.setFontSize(FONTS.body.size);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This report contains the following data tables:', 30, currentY);
    currentY += 10;
    
    tables.forEach((table, index) => {
      pdf.text(`${index + 1}. ${table.title}`, 35, currentY + (index * 8));
    });

    for (let i = 0; i < tables.length; i++) {
      const { selector, title } = tables[i];
      const tableElement = document.querySelector(selector);
      
      if (!tableElement) continue;

      pdf.addPage();
      addHeader(pdf);
      let currentY = addTitle(pdf, title, `Table ${i + 1} of ${tables.length}`);

      try {
        const canvas = await html2canvas(tableElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let position = currentY;

        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        
        // Handle page breaks for large tables
        let heightLeft = imgHeight - (pageHeight - position - 30);
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          addHeader(pdf);
          currentY = addTitle(pdf, title, `Table ${i + 1} of ${tables.length}`);
          pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
          heightLeft -= (pageHeight - currentY - 30);
        }
      } catch (error) {
        console.error(`Failed to capture table ${title}:`, error);
        pdf.setFillColor(...COLORS.lightGray);
        pdf.rect(20, 90, pageWidth - 40, 60, 'F');
        pdf.setTextColor(...COLORS.secondary);
        pdf.setFontSize(FONTS.body.size);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Table data temporarily unavailable', 30, 125);
      }
    }
    
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(pdf, i, totalPages);
    }
    
    const professionalFilename = generateProfessionalFilename('multi_table', mainTitle);
    pdf.save(`${professionalFilename}.pdf`);
    toast.dismiss();
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};