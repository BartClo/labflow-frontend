// Quick test for barcode validation logic used in ResultadoCapturaModal
// Run with: node scripts/test-barcode-validation.js

const sample = {
  id: 'm-001',
  internal_number: 'MU-39881032',
  scanned_barcode: 'BC-39881032',
  codigoBarras: 'BC-39881032'
};

const testCodes = [
  'BC-39881032',
  'BC-39881032 ',
  'bc-39881032',
  'BC39881032',
  'XX-000000'
];

function matchesSampleBarcode(sample, code) {
  if (!sample || !code) return false;
  const sampleBarcode = (sample.scanned_barcode || sample.codigoBarras || sample.codigo_barras || sample.scannedBarcode || '').toString().trim();
  const input = code.toString().trim();
  return sampleBarcode.toUpperCase() === input.toUpperCase();
}

console.log('Sample barcode:', sample.scanned_barcode || sample.codigoBarras);
for (const code of testCodes) {
  console.log(`Test input: "${code}" => match: ${matchesSampleBarcode(sample, code)}`);
}
