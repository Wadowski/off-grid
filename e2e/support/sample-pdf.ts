// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const PAGE_CONTENT = "BT /F1 24 Tf 40 100 Td (Family plan) Tj ET";

const OBJECTS = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
  `<< /Length ${PAGE_CONTENT.length} >>\nstream\n${PAGE_CONTENT}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];

export const samplePdf = (): Buffer => {
  let document = "%PDF-1.4\n";
  const offsets: number[] = [];
  OBJECTS.forEach((body, index) => {
    offsets.push(Buffer.byteLength(document));
    document += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(document);
  const entries = offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`);
  document += `xref\n0 ${OBJECTS.length + 1}\n0000000000 65535 f \n${entries.join("")}`;
  document += `trailer\n<< /Size ${OBJECTS.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(document, "latin1");
};
