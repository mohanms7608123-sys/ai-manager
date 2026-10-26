import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string) {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Excel Export Error:', error);
  }
}

export function exportToPDF(title: string, headers: string[], rows: (string | number)[][], filename: string) {
  try {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    let y = 40;
    doc.setFontSize(11);
    doc.text(headers.join('  |  '), 14, y);
    doc.setLineWidth(0.5);
    doc.line(14, y + 2, 195, y + 2);
    y += 10;

    doc.setFontSize(9);
    rows.forEach(row => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(row.map(r => String(r)).join('  |  '), 14, y);
      y += 8;
    });

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF Export Error:', error);
  }
}
