import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { Transaction, Language, Currency } from '../types';
import { translations, getCategoryTranslation } from '../utils/translations';
import { parseTransactionsCsv, CSV_TEMPLATE } from '../utils/csv';
import { formatCurrency } from '../utils/currency';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newTransactions: Array<Omit<Transaction, 'id'>>) => void;
  lang: Language;
  currency: Currency;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  lang,
  currency
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validRows, setValidRows] = useState<Array<Omit<Transaction, 'id'>>>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isParsed, setIsParsed] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      const res = parseTransactionsCsv(text);
      setValidRows(res.validRows);
      setErrors(res.errors);
      setIsParsed(true);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spendscope_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (validRows.length > 0) {
      onImport(validRows);
      onClose();
    }
  };

  const resetUpload = () => {
    setCsvContent('');
    setFileName('');
    setValidRows([]);
    setErrors([]);
    setIsParsed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-modal-heading"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl p-6 transition-all max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div>
            <h2 id="csv-modal-heading" className="text-base font-semibold text-slate-100">{t.csvModalTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.csvInstructions}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Action to download template */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <FileText className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>{lang === 'te' ? 'సరైన ఫార్మాట్ కోసం నమూనా CSV టెంప్లేట్' : 'Standard column structure: Title, Amount, Type, Category, Date'}</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              aria-label={t.csvDownloadTemplate}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              {t.csvDownloadTemplate}
            </button>
          </div>

          {!isParsed ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Upload CSV file"
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <UploadCloud className="w-10 h-10 text-emerald-400 mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-200">{t.csvDropzone}</p>
              <p className="text-xs text-slate-400 mt-1">Accepts standard .csv files with student transaction logs</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <FileText className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span className="font-mono text-xs">{fileName}</span>
                  <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                  <span className="text-xs text-emerald-400 font-semibold">{validRows.length} {t.csvRowsValid}</span>
                </div>
                <button
                  type="button"
                  onClick={resetUpload}
                  className="text-xs text-slate-400 hover:text-slate-200 underline focus-visible:rounded"
                >
                  Change File
                </button>
              </div>

              {errors.length > 0 && (
                <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg space-y-1">
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    <span>{t.csvErrorsFound} ({errors.length}):</span>
                  </div>
                  <ul className="text-xs text-rose-300/80 list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
                    {errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {errors.length > 5 && <li>...and {errors.length - 5} more issues</li>}
                  </ul>
                </div>
              )}

              {validRows.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    {t.csvPreviewTitle} (first {Math.min(validRows.length, 5)} of {validRows.length})
                  </h3>
                  <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th scope="col" className="py-2 px-3">{t.title}</th>
                          <th scope="col" className="py-2 px-3">{t.type}</th>
                          <th scope="col" className="py-2 px-3">{t.category}</th>
                          <th scope="col" className="py-2 px-3">{t.date}</th>
                          <th scope="col" className="py-2 px-3 text-right">{t.amount}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                        {validRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2 px-3 font-medium text-slate-200">{row.title}</td>
                            <td className="py-2 px-3">
                              <span className={row.type === 'income' ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                                {row.type === 'income' ? t.income : t.expense}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {getCategoryTranslation(row.category, lang)}
                            </td>
                            <td className="py-2 px-3 text-slate-400 font-mono">{row.date}</td>
                            <td className={`py-2 px-3 text-right font-mono font-medium ${row.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {row.type === 'income' ? '+' : '-'}{formatCurrency(row.amount, currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            disabled={validRows.length === 0}
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            {t.confirmImport} ({validRows.length})
          </button>
        </div>
      </div>
    </div>
  );
};
