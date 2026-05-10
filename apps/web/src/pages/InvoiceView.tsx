import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function InvoiceView() {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoiceData();
  }, [tripId]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const tripRes = await apiClient(`/trips/${tripId}`);
      setTrip(tripRes.data);

      const invRes = await apiClient(`/trips/${tripId}/invoice`);
      setInvoice(invRes.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    if (!invoice?.id) return;
    try {
      await apiClient(`/invoices/${invoice.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus: 'paid' }),
      });
      setInvoice({ ...invoice, paymentStatus: 'paid' });
    } catch (e: any) {
      alert('Failed to mark as paid: ' + e.message);
    }
  };

  const downloadPdf = () => {
    // Navigate to API endpoint that returns PDF
    window.open(`/api/trips/${tripId}/invoice/pdf`, '_blank');
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">{error}</div>;

  const budgetData = invoice?.budgetInsights ? [
    { name: 'Spent', value: invoice.budgetInsights.totalSpent },
    { name: 'Remaining', value: Math.max(0, invoice.budgetInsights.remaining) },
  ] : [];
  const COLORS = ['#0f172a', '#e2e8f0']; // Slate-900 for spent, slate-200 for remaining

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-20">
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Link to={`/trips/${tripId}`} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Itinerary
          </Link>
          <div className="flex space-x-3">
            <button 
              onClick={downloadPdf}
              className="inline-flex items-center justify-center rounded-md border border-input bg-white h-9 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" /> Export PDF
            </button>
            {invoice?.paymentStatus !== 'paid' && (
              <button 
                onClick={markAsPaid}
                className="inline-flex items-center justify-center rounded-md bg-green-600 text-white h-9 px-4 py-2 text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
              </button>
            )}
          </div>
        </div>

        {/* Main Invoice Card */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Trip Header */}
          <div className="relative h-48 bg-slate-800 text-white p-8 flex flex-col justify-end overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/40 z-10"></div>
            {trip?.coverPhoto && (
              <img src={trip.coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
            )}
            <div className="relative z-20 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{trip?.title}</h1>
                <p className="text-slate-300 font-medium mt-1">
                  {new Date(trip?.startDate).toLocaleDateString()} - {new Date(trip?.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Invoice</p>
                <p className="text-xl font-mono">{invoice?.invoiceNumber || 'DRAFT'}</p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-border">
            {/* Metadata */}
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Generated On</p>
                <p className="font-semibold text-slate-900">
                  {invoice?.generatedAt ? new Date(invoice.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Payment Status</p>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  invoice?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {invoice?.paymentStatus || 'Pending'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-500 font-medium mb-1">Travelers</p>
                <p className="font-medium text-slate-900">John Doe, Alice Smith</p>
              </div>
            </div>

            {/* Budget Insights */}
            {invoice?.budgetInsights && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Budget Insights</h3>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between w-32"><span className="text-slate-500">Total:</span> <span className="font-medium">${invoice.budgetInsights.totalBudget}</span></p>
                    <p className="flex justify-between w-32"><span className="text-slate-500">Spent:</span> <span className="font-medium">${invoice.budgetInsights.totalSpent}</span></p>
                    <p className="flex justify-between w-32">
                      <span className="text-slate-500">Left:</span> 
                      <span className={`font-medium ${invoice.budgetInsights.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${invoice.budgetInsights.remaining}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetData}
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {budgetData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="p-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">#</th>
                  <th className="py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Description</th>
                  <th className="py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Category</th>
                  <th className="py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider text-right">Qty</th>
                  <th className="py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider text-right">Unit Cost</th>
                  <th className="py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice?.lineItems || []).map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 text-sm text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-4 font-medium text-slate-900">{item.description}</td>
                    <td className="py-4">
                      <span className="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                        {item.category || 'misc'}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600 text-right">{item.qty || 1}</td>
                    <td className="py-4 text-sm text-slate-600 text-right">${Number(item.unitCost).toFixed(2)}</td>
                    <td className="py-4 text-sm font-semibold text-slate-900 text-right">${Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">${Number(invoice?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tax ({invoice?.taxRate || 5}%)</span>
                  <span className="font-medium text-slate-900">${Number(invoice?.taxAmount || 0).toFixed(2)}</span>
                </div>
                {invoice?.discount > 0 && (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Discount</span>
                    <span className="font-medium text-red-600">-${Number(invoice.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t-2 border-slate-900">
                  <span>Grand Total</span>
                  <span>${Number(invoice?.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
