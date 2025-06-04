import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

/**
 * Generates a PDF containing individual dashboard graphs
 * @param {string} filename - Name of the PDF file to download
 * @param {string} title - Title to add at the top of the PDF
 */
export const generateDashboardGraphsPDF = async (filename, title) => {
  try {
    // Show loading toast
    toast.loading('Generating Dashboard Graphs PDF...');
    
    // Initialize jsPDF in landscape for better graph display
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Add title
    pdf.setFontSize(18);
    pdf.text(title, 14, 15);
    
    // Add date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Wait for charts to render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Define sections to capture
    const sections = [
      { selector: '.box-info', title: 'Dashboard Statistics' },
      { selector: '.totalUsers', title: 'User Growth Chart' },
      { selector: '.active-cards', title: 'Active Cards Chart' },
      { selector: '.total-revenue', title: 'Revenue Chart' }
    ];

    // Capture each section
    for (let i = 0; i < sections.length; i++) {
      const { selector, title: sectionTitle } = sections[i];
      const element = document.querySelector(selector);
      
      if (!element) {
        console.warn(`Element not found: ${selector}`);
        continue;
      }

      // Add new page for each section except the first one
      if (i > 0) {
        pdf.addPage();
      }

      // Add section title
      pdf.setFontSize(14);
      pdf.text(sectionTitle, 14, 30);

      // Capture the section
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: true,
        foreignObjectRendering: true,
        backgroundColor: '#ffffff',
        onclone: (document) => {
          const clonedElement = document.querySelector(selector);
          if (clonedElement) {
            // Ensure chart containers are visible
            const chartContainer = clonedElement.querySelector('.recharts-wrapper');
            if (chartContainer) {
              chartContainer.style.minHeight = '300px';
              chartContainer.style.width = '100%';
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 28; // 14mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 14, 40, imgWidth, imgHeight);
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    // Show success toast
    toast.dismiss();
    toast.success('Dashboard graphs PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};

/**
 * Generates a PDF from a table element
 * @param {string} tableSelector - CSS selector for the table element
 * @param {string} filename - Name of the PDF file to download
 * @param {string} title - Title to add at the top of the PDF
 */
export const generateTablePDF = async (tableSelector, filename, title) => {
  try {
    // Show loading toast
    toast.loading('Generating PDF...');
    
    // Get the table element
    const tableElement = document.querySelector(tableSelector);
    if (!tableElement) {
      toast.error('Table content not found');
      return;
    }
    
    // Use html2canvas to render the table as an image
    const canvas = await html2canvas(tableElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
    });
    
    // Initialize jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 14, 15);
    
    // Add date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    // Add content
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190;
    const pageHeight = 290;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 30; // Start after the title
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if necessary
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    // Show success toast
    toast.dismiss();
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};

/**
 * Generates a PDF from a dashboard with multiple sections
 * @param {string} contentSelector - CSS selector for the main content
 * @param {string} filename - Name of the PDF file to download
 * @param {string} title - Title to add at the top of the PDF
 */
export const generateDashboardPDF = async (contentSelector, filename, title) => {
  try {
    // Show loading toast
    toast.loading('Generating Dashboard PDF...');
    
    // Get the dashboard content
    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) {
      toast.error('Dashboard content not found');
      return;
    }
    
    // Use html2canvas to render the dashboard as an image
    const canvas = await html2canvas(contentElement, {
      scale: 1.5, // Balanced scale for dashboard with charts
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: true,
      foreignObjectRendering: true,
    });
    
    // Initialize jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 14, 15);
    
    // Add date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    // Add content
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190;
    const pageHeight = 290;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 30; // Start after the title
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if necessary
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    // Show success toast
    toast.dismiss();
    toast.success('Dashboard PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};

/**
 * Generates a PDF with multiple tables
 * @param {Array<{selector: string, title: string}>} tables - Array of table selectors and their titles
 * @param {string} filename - Name of the PDF file to download
 * @param {string} mainTitle - Main title for the PDF
 */
export const generateMultiTablePDF = async (tables, filename, mainTitle) => {
  try {
    // Show loading toast
    toast.loading('Generating PDF...');
    
    // Initialize jsPDF
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    // Add main title
    pdf.setFontSize(18);
    pdf.text(mainTitle, 14, 15);
    
    // Add date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    let currentY = 30; // Starting Y position after title

    // Process each table
    for (let i = 0; i < tables.length; i++) {
      const { selector, title } = tables[i];
      const tableElement = document.querySelector(selector);
      
      if (!tableElement) {
        console.warn(`Table not found for selector: ${selector}`);
        continue;
      }

      // Add section title
      if (i > 0) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.setFontSize(14);
      pdf.text(title, 14, currentY);
      currentY += 10;

      // Render table
      const canvas = await html2canvas(tableElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add table image
      pdf.addImage(imgData, 'PNG', 10, currentY, imgWidth, imgHeight);
      
      // Update Y position for next table
      currentY += imgHeight + 20;
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    // Show success toast
    toast.dismiss();
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};