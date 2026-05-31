import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Copy, Check, RefreshCw, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { getOrder, updateOrderStatus, downloadEAFile } from '../store';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [serverAlive, setServerAlive] = useState<boolean | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const orderId = searchParams.get('order');

  useEffect(() => { if (orderId) getOrder(orderId).then(o => { if (o) setOrder(o); }).catch(() => {}); }, [orderId]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    setPolling(true); setPollCount(0);
    pollingRef.current = setInterval(async () => {
      setPollCount(c => c + 1);
      if (!orderId) return;
      try {
        const o = await getOrder(orderId);
        if (o && (o.status === 'paid' || o.status === 'completed')) { setOrder(o); stopPolling(); }
        else setServerAlive(!!o);
      } catch { setServerAlive(false); }
      if (pollingRef.current && pollCount >= 59) stopPolling();
    }, 2000);
  }, [orderId, pollCount]);

  const stopPolling = useCallback(() => { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } setPolling(false); }, []);

  useEffect(() => {
    if (order?.status === 'pending' && orderId) startPolling();
    return () => stopPolling();
  }, [order?.status, orderId, startPolling, stopPolling]);

  const handleManualCheck = async () => {
    if (!orderId) return;
    try {
      const o = await getOrder(orderId);
      if (o && (o.status === 'paid' || o.status === 'completed')) { setOrder(o); stopPolling(); }
      else setServerAlive(!!o);
    } catch { setServerAlive(false); }
  };

  const isPaid = order && (order.status === 'paid' || order.status === 'completed');

  return (
    <div className="min-h-screen bg-rs-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <nav className="flex items-center gap-1 text-xs text-rs-gray-500 mb-8"><Link to="/" className="hover:text-rs-blue">Home</Link><ChevronRight className="w-3 h-3" /><span className="text-rs-gray-800 font-medium">Order Status</span></nav>
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPaid ? 'bg-green-100' : 'bg-amber-100'}`}>
            {isPaid ? <CheckCircle className="w-8 h-8 text-rs-green" /> : <Clock className="w-8 h-8 text-amber-500" />}
          </div>
          <h1 className="text-2xl font-bold text-rs-gray-900 mb-2">{isPaid ? 'Payment Confirmed!' : 'Awaiting Confirmation...'}</h1>
          <p className="text-rs-gray-500 text-sm">{isPaid ? 'Your EA is ready for download.' : 'Complete payment on Snippe. We\'ll detect it automatically.'}</p>
        </div>
        {order?.status === 'pending' && (
          <div className="bg-white border border-rs-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              {polling ? <><RefreshCw className="w-4 h-4 text-rs-blue animate-spin" /><span className="text-rs-blue">Checking... (attempt {pollCount + 1}/60)</span></>
               : serverAlive === false ? <><AlertCircle className="w-4 h-4 text-amber-500" /><span className="text-amber-600">Server not reachable</span></>
               : <><Clock className="w-4 h-4 text-rs-gray-400" /><span className="text-rs-gray-500">Paused</span></>}
            </div>
            <button onClick={handleManualCheck} className="mt-2 text-xs text-rs-blue hover:underline flex items-center gap-1 mx-auto"><RefreshCw className="w-3 h-3" /> Check Now</button>
          </div>
        )}
        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-4 text-center">
            <Download className="w-7 h-7 text-rs-green mx-auto mb-2" />
            <h3 className="text-rs-green font-semibold text-sm mb-1">Your EA is Ready!</h3>
            <p className="text-rs-gray-600 text-xs mb-3">{order?.robotName} {order?.robotVersion}</p>
            <button onClick={() => downloadEAFile(order.robotId, order.download_token)} className="bg-rs-green hover:bg-rs-green-dark text-white font-semibold px-5 py-2.5 rounded text-sm inline-flex items-center gap-2"><Download className="w-4 h-4" /> Download File</button>
            <p className="text-rs-gray-400 text-[10px] mt-2">Save → MT4/MT5 → Attach to chart → Trade</p>
          </div>
        )}
        {order && (
          <div className="bg-white border border-rs-gray-200 rounded-lg p-5 mb-6">
            <h3 className="text-sm font-bold text-rs-gray-900 mb-3 pb-2 border-b border-rs-gray-100">Order Details</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-rs-gray-500">Order ID</span><button onClick={() => { navigator.clipboard.writeText(order.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-rs-blue font-mono text-xs flex items-center gap-1 hover:underline">{order.id.substring(0, 18)}... {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</button></div>
              <div className="flex justify-between"><span className="text-rs-gray-500">EA</span><span className="text-rs-gray-800">{order.robotName}</span></div>
              <div className="flex justify-between"><span className="text-rs-gray-500">Amount</span><span className="font-bold text-rs-gray-900">${order.amount}</span></div>
              <div className="flex justify-between"><span className="text-rs-gray-500">Status</span><span className={`font-medium capitalize text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' || order.status === 'completed' ? 'bg-green-100 text-rs-green' : order.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-rs-red'}`}>{order.status}</span></div>
              <div className="flex justify-between"><span className="text-rs-gray-500">Date</span><span className="text-rs-gray-800">{new Date(order.createdAt).toLocaleString('en-US')}</span></div>
            </div>
          </div>
        )}
        <Link to="/" className="flex items-center justify-center gap-2 text-rs-blue hover:text-rs-blue-dark font-medium text-sm">Continue Shopping <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </div>
  );
}
