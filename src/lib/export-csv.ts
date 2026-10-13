/**
 * Hbibna CSV Export Utility
 * 
 * Generates standards-compliant CSV files with UTF-8 BOM encoding
 * for seamless compatibility with Microsoft Excel, Google Sheets,
 * and LibreOffice, supporting Arabic, French, and English characters.
 */

import type { Customer, Transaction } from '@/types/database';
import { formatPhoneNumber } from '@/lib/phone';

function downloadCsvFile(content: string, filename: string) {
  // UTF-8 BOM (\uFEFF) ensures Excel properly renders accented and Arabic text
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports customers list to CSV format
 */
export function exportCustomersToCsv(customers: Customer[], businessName = 'Hbibna') {
  const headers = [
    'ID Client',
    'Nom',
    'Téléphone',
    'Email',
    'Solde Points',
    'Code Parrainage',
    'Date Inscription',
  ];

  const rows = customers.map((c) => [
    escapeCsvField(c.id),
    escapeCsvField(c.name),
    escapeCsvField(formatPhoneNumber(c.phone)),
    escapeCsvField(c.email || ''),
    escapeCsvField(c.points_balance),
    escapeCsvField(c.referral_code || ''),
    escapeCsvField(new Date(c.created_at).toLocaleDateString('fr-DZ')),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadCsvFile(csvContent, `clients_${cleanName}_${dateStr}.csv`);
}

/**
 * Exports transactions history to CSV format
 */
export function exportTransactionsToCsv(transactions: Transaction[], businessName = 'Hbibna') {
  const headers = [
    'ID Transaction',
    'Date & Heure',
    'Type',
    'Client',
    'Téléphone',
    'Montant Achat (DA)',
    'Points',
    'Description',
  ];

  const rows = transactions.map((t) => [
    escapeCsvField(t.id),
    escapeCsvField(new Date(t.created_at).toLocaleString('fr-DZ')),
    escapeCsvField(t.type === 'earn' ? 'Attribution Points' : 'Utilisation Récompense'),
    escapeCsvField(t.customer?.name || 'Client'),
    escapeCsvField(t.customer?.phone ? formatPhoneNumber(t.customer.phone) : ''),
    escapeCsvField(t.amount || 0),
    escapeCsvField(t.points),
    escapeCsvField(t.description || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadCsvFile(csvContent, `transactions_${cleanName}_${dateStr}.csv`);
}
