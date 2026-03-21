import jsPDF from 'jspdf';

export interface CertificaatData {
  userName: string;
  userEmail: string;
  leerpadTitel: string;
  modules: Array<{
    titel: string;
    score: number;
  }>;
  totaalScore: number;
  datum: string;
  directieNaam: string;
}

export function generateCertificaatPDF(data: CertificaatData): Blob {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // === BACKGROUND BORDER ===
  doc.setDrawColor(76, 128, 119); // brand-green
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner decorative border
  doc.setDrawColor(229, 48, 19); // brand-red
  doc.setLineWidth(0.5);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // === HEADER ===
  let y = 40;

  // Title
  doc.setFontSize(36);
  doc.setTextColor(76, 128, 119);
  doc.text('CERTIFICAAT', pageWidth / 2, y, { align: 'center' });

  // Subtitle
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text('van professionele ontwikkeling', pageWidth / 2, y, { align: 'center' });

  // === MAIN CONTENT ===
  y += 20;

  // Intro text
  doc.setFontSize(14);
  doc.setTextColor(60);
  doc.text('Hierbij verklaren wij dat', pageWidth / 2, y, { align: 'center' });

  // User name
  y += 15;
  doc.setFontSize(24);
  doc.setTextColor(229, 48, 19);
  doc.text(data.userName, pageWidth / 2, y, { align: 'center' });

  // Leerpad intro
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(60);
  doc.text('succesvol het leerpad heeft afgerond:', pageWidth / 2, y, { align: 'center' });

  // Leerpad title
  y += 12;
  doc.setFontSize(20);
  doc.setTextColor(76, 128, 119);
  doc.text(`"${data.leerpadTitel}"`, pageWidth / 2, y, { align: 'center' });

  // === MODULES ===
  y += 18;
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text('Voltooide modules:', pageWidth / 2, y, { align: 'center' });

  y += 8;
  const moduleStartX = pageWidth / 2 - 60;

  data.modules.forEach((module) => {
    const moduleY = y;

    // Checkmark
    doc.setTextColor(76, 128, 119);
    doc.text('✓', moduleStartX, moduleY);

    // Module title
    doc.setTextColor(60);
    doc.setFontSize(10);
    doc.text(module.titel, moduleStartX + 8, moduleY);

    // Score color based on performance
    let r = 180, g = 60, b = 60;
    if (module.score >= 70) {
      r = 76; g = 128; b = 119;
    } else if (module.score >= 50) {
      r = 150; g = 100; b = 50;
    }
    doc.setTextColor(r, g, b);
    doc.text(`${module.score}%`, moduleStartX + 120, moduleY);

    y += 7;
  });

  // === TOTAL SCORE ===
  y += 5;
  doc.setFontSize(12);
  doc.setTextColor(60);
  doc.text(`Totaal gemiddelde: `, pageWidth / 2 - 20, y, { align: 'center' });
  doc.setTextColor(76, 128, 119);
  doc.setFontSize(14);
  doc.text(`${data.totaalScore}%`, pageWidth / 2 + 25, y, { align: 'center' });

  // === DATE ===
  y += 15;
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Datum van uitreiking: ${data.datum}`, pageWidth / 2, y, { align: 'center' });

  // === SIGNATURE ===
  y += 20;

  // Signature line
  doc.setDrawColor(150);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);

  // Director name
  y += 6;
  doc.setFontSize(12);
  doc.setTextColor(60);
  doc.text(data.directieNaam, pageWidth / 2, y, { align: 'center' });

  // Director title
  y += 5;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Directeur, GO! atheneum Gentbrugge', pageWidth / 2, y, { align: 'center' });

  // === FOOTER ===
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text('ICT-Advies | Professionalisering', pageWidth / 2, pageHeight - 20, { align: 'center' });

  return doc.output('blob');
}
