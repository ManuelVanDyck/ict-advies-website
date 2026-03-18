import jsPDF from 'jspdf';

export interface PDFData {
  tutorial: string;
  opdracht_titel: string;
  instructie: string;
  antwoorden: Record<string, any>;
  score?: number;
  feedback?: string;
  details?: Array<{ criterium: string; score: number; feedback: string }>;
  user_name: string;
  date: string;
}

export function generateOpdrachtPDF(data: PDFData): Blob {
  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.text(`Opdracht: ${data.opdracht_titel}`, 20, y);
  y += 15;

  // Header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Naam: ${data.user_name}`, 20, y);
  doc.text(`Datum: ${data.date}`, 20, y + 6);
  doc.text(`Tutorial: ${data.tutorial}`, 20, y + 12);
  y += 25;

  // Instruction
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Instructie:', 20, y);
  y += 8;
  doc.setFontSize(10);
  const instructieLines = doc.splitTextToSize(data.instructie, 170);
  doc.text(instructieLines, 20, y);
  y += instructieLines.length * 5 + 10;

  // Answers
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Antwoorden:', 20, y);
  y += 8;

  Object.entries(data.antwoorden).forEach(([key, value]) => {
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`${key}:`, 20, y);
    y += 5;

    const valueText = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    const valueLines = doc.splitTextToSize(valueText, 160);
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.text(valueLines, 25, y);
    y += valueLines.length * 5 + 5;

    // New page if needed
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
  });

  // Resultaten (if submitted)
  if (data.score !== undefined) {
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resultaten:', 20, y);
    y += 8;

    // Score
    doc.setFontSize(14);
    doc.setTextColor(data.score >= 70 ? 0 : data.score >= 50 ? 100 : 200);
    doc.text(`Score: ${data.score}/100`, 20, y);
    y += 10;

    // Feedback
    if (data.feedback) {
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text('Feedback:', 20, y);
      y += 5;

      const feedbackLines = doc.splitTextToSize(data.feedback, 170);
      doc.setFontSize(9);
      doc.text(feedbackLines, 20, y);
      y += feedbackLines.length * 5 + 10;
    }

    // Details
    if (data.details && data.details.length > 0) {
      y += 5;
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text('Details per criterium:', 20, y);
      y += 8;

      data.details.forEach((detail) => {
        doc.setFontSize(9);
        doc.setTextColor(50);
        doc.text(`${detail.criterium}: ${detail.score}/100`, 20, y);
        y += 5;

        const detailLines = doc.splitTextToSize(detail.feedback, 160);
        doc.setTextColor(0);
        doc.setFontSize(8);
        doc.text(detailLines, 25, y);
        y += detailLines.length * 5 + 8;

        if (y > 250) {
          doc.addPage();
          y = 20;
        }
      });
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`ICT-Advies - AI Bewustzijn - Pagina ${i}/${pageCount}`, 20, 285);
  }

  return doc.output('blob');
}
