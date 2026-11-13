import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  getStoredInvoices,
  BilledInvoice,
  generateSatXmlString,
} from '../../data/billingData';
import {
  FileText,
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Printer,
  Calendar,
  Building2,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<BilledInvoice[]>(getStoredInvoices());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'VIGENTE' | 'CANCELADA'>('TODOS');
  const [selectedInvoice, setSelectedInvoice] = useState<BilledInvoice | null>(null);
  const [cancelModalInvoice, setCancelModalInvoice] = useState<BilledInvoice | null>(null);
  const [cancelReason, setCancelReason] = useState('02 - Comprobante emitido con errores sin relación');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.ticketFolio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFacturado = invoices
    .filter((i) => i.status === 'VIGENTE')
    .reduce((acc, curr) => acc + curr.total, 0);

  const totalIva = invoices
    .filter((i) => i.status === 'VIGENTE')
    .reduce((acc, curr) => acc + curr.iva, 0);

  const handleDownloadXml = (inv: BilledInvoice) => {
    const xmlContent = generateSatXmlString(inv);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.rfc}_${inv.id}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmCancel = () => {
    if (!cancelModalInvoice) return;
    const updated = invoices.map((inv) =>
      inv.id === cancelModalInvoice.id ? { ...inv, status: 'CANCELADA' as const } : inv
    );
    setInvoices(updated);
    localStorage.setItem('lavaclean_invoices_v1', JSON.stringify(updated));
    setCancelModalInvoice(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={FileText}
        title="Facturas Electrónicas & CFDIs"
        subtitle="Registro y auditoría fiscal de facturas emitidas por ventas de mostrador y pedidos en línea (SAT CFDI 4.0)"
      />

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Facturado Vigente</span>
          <span className="text-2xl font-black text-[#580f36] block mt-1">
            ${totalFacturado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Monto acumulado del mes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">IVA Trasladado (16%)</span>
          <span className="text-2xl font-black text-slate-800 block mt-1">
            ${totalIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Impuesto a enterar al SAT</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Comprobantes Emitidos</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">
            {invoices.filter((i) => i.status === 'VIGENTE').length}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">CFDIs activos</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Canceladas / Sustituidas</span>
          <span className="text-2xl font-black text-red-600 block mt-1">
            {invoices.filter((i) => i.status === 'CANCELADA').length}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Con acuse de cancelación</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por RFC, Razón Social, Folio o UUID fiscal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#580f36]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
            {(['TODOS', 'VIGENTE', 'CANCELADA'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-white text-[#580f36] shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Folio / Fecha</th>
                <th className="py-3 px-4">Cliente / RFC</th>
                <th className="py-3 px-4">UUID SAT (Folio Fiscal)</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">IVA (16%)</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Estatus</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron facturas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#580f36] block">{inv.id}</span>
                      <span className="text-[11px] text-slate-500 block">{inv.stampedAt}</span>
                      <span className="text-[10px] text-slate-400 block">Ticket: {inv.ticketFolio}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block max-w-xs truncate">{inv.razonSocial}</span>
                      <span className="font-mono text-[11px] text-slate-600 block">{inv.rfc}</span>
                      <span className="text-[10px] text-slate-400 block">{inv.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block max-w-[200px] truncate">
                        {inv.uuid}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{inv.regimenFiscal.split(' - ')[0]}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium">${inv.subtotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium">${inv.iva.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">${inv.total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'VIGENTE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {inv.status === 'VIGENTE' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Vigente</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Cancelada</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="action-btn action-btn-view"
                          title="Ver Detalle / Imprimir PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadXml(inv)}
                          className="action-btn action-btn-download"
                          title="Descargar XML CFDI 4.0"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {inv.status === 'VIGENTE' && (
                          <button
                            onClick={() => setCancelModalInvoice(inv)}
                            className="action-btn action-btn-delete"
                            title="Cancelar Factura ante el SAT"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Vista Detalle / Impresión */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#580f36]" />
                <h3 className="text-base font-black text-slate-900">
                  Comprobante Fiscal Digital {selectedInvoice.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar ventana (X)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Folio Fiscal (UUID):</span>
                <span className="font-mono font-bold text-slate-800">{selectedInvoice.uuid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receptor:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.razonSocial} ({selectedInvoice.rfc})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Régimen & Uso:</span>
                <span>{selectedInvoice.regimenFiscal} • {selectedInvoice.usoCfdi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha y Hora de Timbrado:</span>
                <span>{selectedInvoice.stampedAt}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Artículos Facturados:</span>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="p-2">Descripción</th>
                    <th className="p-2 text-center">Cant</th>
                    <th className="p-2 text-right">P. Unitario</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-2">{it.description}</td>
                      <td className="p-2 text-center font-bold">{it.quantity}</td>
                      <td className="p-2 text-right">${it.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold">${it.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3 text-xs space-y-1">
              <div className="w-48 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA (16%):</span>
                  <span className="font-bold">${selectedInvoice.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#580f36] pt-1 border-t">
                  <span>Total:</span>
                  <span>${selectedInvoice.total.toFixed(2)} MXN</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => handleDownloadXml(selectedInvoice)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar XML</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-5 py-2 bg-[#580f36] text-white rounded-lg text-xs font-bold hover:bg-[#430b29] transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancelación ante el SAT */}
      {cancelModalInvoice && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setCancelModalInvoice(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-black text-slate-900">
                  Cancelar Factura {cancelModalInvoice.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalInvoice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar ventana (X)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Estás a punto de solicitar la cancelación fiscal del CFDI con UUID:{' '}
              <strong className="font-mono text-slate-800">{cancelModalInvoice.uuid}</strong> ante los servidores del SAT.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motivo de Cancelación SAT:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="01 - Comprobante emitido con errores con relación">01 - Comprobante emitido con errores con relación</option>
                <option value="02 - Comprobante emitido con errores sin relación">02 - Comprobante emitido con errores sin relación</option>
                <option value="03 - No se llevó a cabo la operación">03 - No se llevó a cabo la operación</option>
                <option value="04 - Operación nominativa relacionada en una factura global">04 - Operación nominativa relacionada en una factura global</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setCancelModalInvoice(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
