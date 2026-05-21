import { Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import type { ChangeEvent, DragEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

interface PatientImportDialogProps {
  open: boolean;
  loading?: boolean;
  onImport: (file: File) => void;
  onClose: () => void;
}

const acceptedExtensions = ['.xlsx', '.xls', '.csv'];

export function PatientImportDialog({ open, loading, onImport, onClose }: PatientImportDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setError('');
      setDragActive(false);
    }
  }, [open]);

  if (!open) return null;

  const validateFile = (candidate?: File) => {
    if (!candidate) return;

    const fileName = candidate.name.toLowerCase();
    const isValid = acceptedExtensions.some((extension) => fileName.endsWith(extension));

    if (!isValid) {
      setFile(null);
      setError('Format invalide. Choisissez un fichier .xlsx, .xls ou .csv.');
      return;
    }

    setFile(candidate);
    setError('');
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    validateFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    validateFile(event.dataTransfer.files?.[0]);
  };

  const downloadTemplate = () => {
    const headers = ['nom', 'prenom', 'cin', 'telephone', 'date_naissance', 'organisme', 'numero_assurance', 'groupe_dialyse', 'statut'];
    const example = ['El Amrani', 'Salma', 'AB123456', '0612345678', '1980-05-12', 'CNSS', 'CNSS123456789', 'L/M/V', 'actif'];
    const csv = `${headers.join(',')}\n${example.join(',')}\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');

    link.href = url;
    link.download = 'modele-import-patients.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!file) {
      setError('Selectionnez un fichier Excel ou CSV avant d importer.');
      return;
    }

    onImport(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8">
      <div role="dialog" aria-modal="true" aria-labelledby="patient-import-title" className="mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="patient-import-title" className="text-lg font-bold text-[#1E3A5F]">Importer les patients</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <label
            htmlFor="patients-import-file"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
              dragActive ? 'border-[#2563EB] bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-[#2563EB] hover:bg-blue-50/40'
            }`}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#2563EB] shadow-sm">
              <Upload className="h-6 w-6" />
            </span>
            <span className="mt-4 text-sm font-bold text-slate-800">
              {file ? file.name : 'Glissez-deposez votre fichier ici'}
            </span>
            <span className="mt-1 text-xs text-slate-500">Formats acceptes : .xlsx, .xls, .csv</span>
            <input
              ref={inputRef}
              id="patients-import-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={handleInputChange}
            />
          </label>

          {error && <p className="text-sm font-semibold text-[#DC2626]">{error}</p>}

          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">
            Colonnes requises : nom, pr&eacute;nom, CIN, t&eacute;l&eacute;phone, date naissance, organisme, groupe dialyse, statut.
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={downloadTemplate} disabled={loading}>
              <Download className="h-4 w-4" />
              T&eacute;l&eacute;charger mod&egrave;le Excel
            </button>
            <button type="button" className="btn-primary w-full sm:w-auto" onClick={handleImport} disabled={loading}>
              <FileSpreadsheet className="h-4 w-4" />
              {loading ? 'Import...' : 'Importer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
