import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, AlertTriangle, ExternalLink, CreditCard } from 'lucide-react';
import { getRobot, getSettings, generateId, generateDownloadToken, saveOrder, buildPaymentPageUrl } from '../store';
import { Robot, AdminSettings } from '../types';

const defaultSettings: AdminSettings = { paymentPageUrl:'', webhookSecret:'', webhookUrl:'', redirectUrl:'', merchantName:'FXEA Store', currency:'USD', webhookServerUrl:'' };

export default function Checkout() {
  const [robot, setRobot] = useState<Robot | null>(null);
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name:'', email:'', phone:'', mt_account:'' });

  useEffect(() => {
    const robotId = sessionStorage.getItem('checkout_robot_id');
    if (robotId) getRobot(robotId).then(found => { if (found) setRobot(found); });
    getSettings().then(setSettings);
  }, []);

  if (!robot) return <div className="min-h-screen bg-rs-gray-50 flex items-center justify-center"><div className="text-center"><p className="text-rs-gray-500 mb-4">No EA selected</p><Link to="/" className="text-rs-blue hover:underline">Browse EAs</Link></div></div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!form.name || !form.phone || !form.email) { setError('Please fill in all required fields.'); return; }
    if (!settings.paymentPageUrl) { setError('Payment page not configured.'); return; }
    setLoading(true);
    try {
      const orderId = generateId();
      const downloadToken = generateDownloadToken();
      const checkoutUrl = buildPaymentPageUrl(settings.paymentPageUrl, { order_id:orderId, user_id:form.email, plan:robot.id, ea_id:robot.id, customer_email:form.email, customer_phone:form.phone, mt_account:form.mtAccount||'N/A', amount:robot.price.toString() });
      await saveOrder({ id:orderId, product_id:robot.id, product_name:robot.name,  customer_name:form.name, customer_email:form.email, customer_phone:form.phone, mt_account:form.mtAccount||'', amount:robot.price, currency:'USD', status:'pending', payment_reference:'',  download_token:downloadToken, created_at:new Date().toISOString() });
      window.location.href = checkoutUrl;
    } catch (err: any) { setError(err.message || 'Something went wrong.'); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-rs-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-1 text-xs text-rs-gray-500 mb-6"><Link to="/" className="hover:text-rs-blue">Home</Link><ChevronRight className="w-3 h-3" /><Link to={`/ea/${robot.id}`} className="hover:text-rs-blue">{robot.name}</Link><ChevronRight className="w-3 h-3" /><span className="text-rs-gray-800 font-medium">Checkout</span></nav>
        <h1 className="text-2xl font-bold text-rs-gray-900 mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white border border-rs-gray-200 rounded-lg p-5 sticky top-28">
              <h2 className="text-sm font-bold text-rs-gray-900 mb-4 pb-3 border-b border-rs-gray-100">Order Summary</h2>
              <div className="flex gap-3 mb-4">
                <img src={robot.image} alt={robot.name} className="w-16 h-16 rounded object-cover" onError={e => {(e.target as HTMLImageElement).src = 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#f3f4f6"><rect width="64" height="64"/></svg>')}} />
                <div><p className="text-sm font-semibold text-rs-gray-800">{robot.name}</p><p className="text-xs text-rs-gray-500">{robot.category} • {robot.version}</p><p className="text-rs-blue font-bold text-sm mt-0.5">${robot.price}</p></div>
              </div>
              <div className="space-y-2 text-sm border-t border-rs-gray-100 pt-3">
                <div className="flex justify-between"><span className="text-rs-gray-500">License</span><span className="text-rs-gray-800">Lifetime</span></div>
                <div className="flex justify-between"><span className="text-rs-gray-500">Delivery</span><span className="text-rs-green font-medium">Instant Download</span></div>
                <div className="flex justify-between border-t border-rs-gray-100 pt-2 font-bold"><span className="text-rs-gray-900">Total</span><span className="text-rs-gray-900">${robot.price}</span></div>
              </div>
              <div className="mt-4 p-2.5 bg-rs-blue-light rounded flex items-center gap-2"><CreditCard className="w-4 h-4 text-rs-blue flex-shrink-0" /><p className="text-rs-blue text-[11px]">Pay on Snippe's secure page — M-Pesa, Airtel Money, Visa & Mastercard</p></div>
            </div>
          </div>
          <div className="lg:col-span-3 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white border border-rs-gray-200 rounded-lg p-5">
                <h2 className="text-sm font-bold text-rs-gray-900 mb-4">Customer Details</h2>
                <div className="space-y-4">
                  {[{l:'Full Name',k:'name',t:'text',p:'John Doe',r:true},{l:'Email Address',k:'email',t:'email',p:'john@example.com',r:true,h:'EA download link sent here'},{l:'Phone Number',k:'phone',t:'tel',p:'+255 7XX XXX XXX',r:true,h:'For mobile money payments'},{l:'MT4/MT5 Account',k:'mtAccount',t:'text',p:'e.g. 12345678',r:false,h:'For license activation'}].map(f=>(
                    <div key={f.k}>
                      <label className="block text-xs font-medium text-rs-gray-700 mb-1">{f.l}{f.r && <span className="text-rs-red"> *</span>}{!f.r && <span className="text-rs-gray-400"> (optional)</span>}</label>
                      <input type={f.t} required={f.r} value={(form as any)[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.p} className="w-full border border-rs-gray-300 rounded px-3 py-2.5 text-sm text-rs-gray-800 placeholder-rs-gray-400 focus:outline-none focus:border-rs-blue" />
                      {f.h && <p className="text-[10px] text-rs-gray-400 mt-1">{f.h}</p>}
                    </div>
                  ))}
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-rs-red flex-shrink-0 mt-0.5" /><p className="text-rs-red text-sm">{error}</p></div>}
              {!settings.paymentPageUrl && <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /><p className="text-amber-700 text-sm">Payment page not configured by admin.</p></div>}
              <button type="submit" disabled={loading||!settings.paymentPageUrl} className="w-full bg-rs-blue hover:bg-rs-blue-dark disabled:bg-rs-gray-300 disabled:cursor-not-allowed text-white disabled:text-rs-gray-500 font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2 text-sm">
                <ExternalLink className="w-4 h-4" />{loading ? 'Redirecting...' : `Proceed to Payment — $${robot.price}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
