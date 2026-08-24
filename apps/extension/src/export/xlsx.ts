import * as XLSX from 'xlsx';

export function downloadWorkbook(rows: readonly Record<string, unknown>[], filename = 'fastcup-scout.xlsx'): void {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([...rows]), 'SUMMARY');
  const base64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
  void browser.downloads.download({ url: `data:application/octet-stream;base64,${base64}`, filename, saveAs: true });
}
