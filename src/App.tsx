import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Undo, Redo, Download, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatInTimeZone } from 'date-fns-tz';

type RowData = {
  id: string;
  item: string;
  description: string;
  ref: string;
  visible: boolean;
};

type AppState = {
  headerImage: string | null;
  rows: RowData[];
};

const initialRows: RowData[] = [
  { id: '1', item: 'Cemento 42 Kg', description: 'is simply dummy text of the printing and typesetting', ref: '9', visible: true },
  { id: '2', item: 'Viga Doble T', description: "industry. Lorem Ipsum has been the industry's standard", ref: '80', visible: true },
  { id: '3', item: 'Cabilla 1/2"', description: 'dummy text ever since the 1500s, when an unknown', ref: '3', visible: true },
  { id: '4', item: 'Cabilla 1"', description: 'printer took a galley of type and scrambled it to make a', ref: '7', visible: true },
  { id: '5', item: 'Cabilla 2"', description: 'type specimen book. It has survived not only five', ref: '515', visible: true },
  { id: '6', item: 'Piedra Picada', description: 'centuries, but also the leap into electronic typesetting,', ref: '45', visible: true },
  { id: '7', item: 'Arena Lavada', description: 'remaining essentially unchanged. It was popularised in', ref: '561', visible: true },
  { id: '8', item: 'Polvillo', description: 'the 1960s with the release of Letraset sheets containing', ref: '525', visible: true },
  { id: '9', item: 'Lamina de Zinc', description: 'Lorem Ipsum passages, and more recently with desktop', ref: '858', visible: true },
  { id: '10', item: 'Tubo Estructural', description: 'It is a long established fact that a reader will be distracted', ref: '455', visible: true },
  { id: '11', item: 'Bloque Arcilla #10', description: 'by the readable content of a page when looking at its', ref: '58', visible: true },
  { id: '12', item: 'Bloque Arcilla #12', description: 'layout. The point of using Lorem Ipsum is that it has a', ref: '87', visible: true },
  { id: '13', item: 'Bloque de Cemento', description: 'more-or-less normal distribution of letters, as opposed to', ref: '796', visible: true },
  { id: '14', item: 'Dry Wall', description: "using 'Content here, content here', making it look like", ref: '65', visible: true },
  { id: '15', item: 'Cal en pasta', description: 'readable English. Many desktop publishing packages', ref: '75', visible: true },
];

const initialState: AppState = {
  headerImage: null,
  rows: initialRows,
};

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
      checked ? 'bg-[#2B5B5A]' : 'bg-[#d1d5db]'
    }`}
  >
    <div
      className={`bg-[#ffffff] w-4 h-4 rounded-full transform transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
      style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
    />
  </button>
);

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [history, setHistory] = useState<AppState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateDate = () => {
      const dateStr = formatInTimeZone(new Date(), 'America/Caracas', 'dd/MM/yyyy hh:mm a');
      setCurrentDate(dateStr);
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const commitState = (newState: AppState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const updateState = (newState: AppState) => {
    setState(newState);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      commitState(newState);
    }, 500);
  };

  const undo = () => {
    if (currentIndex > 0) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex]);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex]);
    }
  };

  const addRowAfter = (index: number) => {
    const newRow: RowData = {
      id: Math.random().toString(36).substr(2, 9),
      item: '',
      description: '',
      ref: '',
      visible: true,
    };
    const newRows = [...state.rows];
    newRows.splice(index + 1, 0, newRow);
    updateState({ ...state, rows: newRows });
  };

  const removeRow = (id: string) => {
    const newRows = state.rows.filter(r => r.id !== id);
    if (newRows.length === 0) {
      newRows.push({
        id: Math.random().toString(36).substr(2, 9),
        item: '',
        description: '',
        ref: '',
        visible: true,
      });
    }
    updateState({ ...state, rows: newRows });
  };

  const toggleRow = (id: string) => {
    const newRows = state.rows.map(r => r.id === id ? { ...r, visible: !r.visible } : r);
    updateState({ ...state, rows: newRows });
  };

  const updateRowText = (id: string, field: keyof RowData, value: string) => {
    const newRows = state.rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    updateState({ ...state, rows: newRows });
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        updateState({ ...state, headerImage: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = async () => {
    setIsExporting(true);
    // Wait for React to re-render without UI elements
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageElements = document.querySelectorAll('.pdf-page');
      
      for (let i = 0; i < pageElements.length; i++) {
        const element = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save('documento.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const ROWS_PER_PAGE = 14;
  const visibleRows = isExporting ? state.rows.filter(r => r.visible) : state.rows;
  
  const pages = [];
  for (let i = 0; i < visibleRows.length; i += ROWS_PER_PAGE) {
    pages.push(visibleRows.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-8 flex flex-col items-center font-sans text-[#111827]">
      
      {/* Document Pages */}
      <div className="flex flex-col gap-8 items-center w-full">
        {pages.map((pageRows, pageIndex) => (
          <div
            key={pageIndex}
            className={`pdf-page bg-[#ffffff] w-full max-w-[210mm] relative transition-all duration-300 ${
              isExporting ? 'p-[15mm]' : 'p-6 sm:p-10'
            }`}
            style={{ minHeight: '297mm', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Header Image */}
            <div 
              className={`w-full mb-6 relative group ${!isExporting ? 'cursor-pointer' : ''}`} 
              onClick={!isExporting ? handleImageUpload : undefined}
            >
              {state.headerImage ? (
                <img src={state.headerImage} alt="Header" className="w-full h-auto object-contain max-h-64" />
              ) : (
                !isExporting && (
                  <div className="w-full h-48 bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors flex flex-col items-center justify-center border-2 border-dashed border-[#d1d5db] rounded-lg">
                    <ImageIcon className="text-[#9ca3af] mb-2" size={48} />
                    <span className="text-[#6b7280] font-medium">Haz clic para subir imagen de encabezado</span>
                  </div>
                )
              )}
              {pageIndex === 0 && (
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onImageChange} />
              )}
            </div>

            {/* Date */}
            <div className={`w-full text-left mb-6 font-bold text-xl ${isExporting ? 'px-0' : 'px-0 sm:px-12'}`}>
              <span className="text-sm text-[#6b7280] font-normal">({currentDate})</span>
            </div>

            {/* Table */}
            <div className="w-full flex justify-center">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {!isExporting && <th className="w-20 sm:w-24 text-[7px] sm:text-[8.5px] font-bold text-center pb-2 uppercase tracking-wider">Disponibilidad</th>}
                    <th className="border-2 border-[#000000] p-2 sm:p-3 font-bold text-center w-1/4">Item</th>
                    <th className="border-2 border-[#000000] p-2 sm:p-3 font-bold text-center w-1/2">Descripción</th>
                    <th className="border-2 border-[#000000] p-2 sm:p-3 font-bold text-center w-20 sm:w-24">REF.</th>
                    {!isExporting && <th className="w-24 sm:w-32 text-[7px] sm:text-[8.5px] font-bold text-center pb-2 uppercase tracking-wider leading-tight">Agregar/Eliminar<br/>Fila</th>}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, rowIndex) => {
                    const absoluteIndex = pageIndex * ROWS_PER_PAGE + rowIndex;
                    return (
                      <tr key={row.id} className={!row.visible && !isExporting ? 'opacity-40 bg-[#f9fafb]' : ''}>
                        {!isExporting && (
                          <td className="p-1 sm:p-2 text-center align-middle border-none">
                            <div className="flex justify-center">
                              <Toggle checked={row.visible} onChange={() => toggleRow(row.id)} />
                            </div>
                          </td>
                        )}
                        <td className="border-2 border-[#000000] p-0 h-10 sm:h-12">
                          {isExporting ? (
                            <div className="w-full h-full p-2 flex items-center justify-center text-center overflow-hidden whitespace-nowrap text-sm sm:text-base">{row.item}</div>
                          ) : (
                            <input
                              type="text"
                              value={row.item}
                              onChange={(e) => updateRowText(row.id, 'item', e.target.value)}
                              maxLength={20}
                              className="w-full h-full p-1 sm:p-2 text-center outline-none bg-transparent text-sm sm:text-base"
                            />
                          )}
                        </td>
                        <td className="border-2 border-[#000000] p-0 h-10 sm:h-12">
                          {isExporting ? (
                            <div className="w-full h-full p-2 flex items-center justify-center text-center overflow-hidden whitespace-nowrap text-sm sm:text-base">{row.description}</div>
                          ) : (
                            <input
                              type="text"
                              value={row.description}
                              onChange={(e) => updateRowText(row.id, 'description', e.target.value)}
                              maxLength={50}
                              className="w-full h-full p-1 sm:p-2 text-center outline-none bg-transparent text-sm sm:text-base"
                            />
                          )}
                        </td>
                        <td className="border-2 border-[#000000] p-0 h-10 sm:h-12">
                          {isExporting ? (
                            <div className="w-full h-full p-2 flex items-center justify-center text-center overflow-hidden whitespace-nowrap text-sm sm:text-base">{row.ref}</div>
                          ) : (
                            <input
                              type="text"
                              value={row.ref}
                              onChange={(e) => updateRowText(row.id, 'ref', e.target.value)}
                              maxLength={10}
                              className="w-full h-full p-1 sm:p-2 text-center outline-none bg-transparent text-sm sm:text-base"
                            />
                          )}
                        </td>
                        {!isExporting && (
                          <td className="p-1 sm:p-2 text-center align-middle border-none">
                            <div className="flex justify-center items-center gap-2 sm:gap-4">
                              <button onClick={() => addRowAfter(absoluteIndex)} className="text-[#000000] hover:scale-125 transition-transform">
                                <Plus size={20} strokeWidth={3} />
                              </button>
                              <button onClick={() => removeRow(row.id)} className="text-[#000000] hover:scale-125 transition-transform">
                                <Minus size={20} strokeWidth={3} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      {!isExporting && (
        <div className="w-full max-w-[210mm] mt-8 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 gap-6">
          <div className="flex gap-8 sm:gap-16">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`flex flex-col items-center gap-2 font-bold transition-opacity ${!canUndo ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-70'}`}
            >
              <Undo size={36} strokeWidth={2.5} />
              <span className="text-xs sm:text-sm text-center">DESHACER<br/>ULTIMO CAMBIO</span>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`flex flex-col items-center gap-2 font-bold transition-opacity ${!canRedo ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-70'}`}
            >
              <Redo size={36} strokeWidth={2.5} />
              <span className="text-xs sm:text-sm text-center">REHACER<br/>&nbsp;</span>
            </button>
          </div>
          
          <button
            onClick={generatePDF}
            className="flex flex-col items-center gap-2 font-bold text-[#ffffff] bg-[#2B5B5A] hover:bg-[#1f4241] px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
          >
            <Download size={32} strokeWidth={2.5} />
            <span className="text-sm">DESCARGAR PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}
