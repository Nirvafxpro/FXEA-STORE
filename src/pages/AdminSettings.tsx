import { useState, useEffect } from 'react';
import { Save, ExternalLink, Webhook, Shield, Copy, Check, Terminal } from 'lucide-react';
import { getSettings, saveSettings } from '../store';

const def: any = { paymentPageUrl:'', webhookSecret:'', webhookUrl:'', redirectUrl:'', merchantName:'FXEA Store', currency:'USD', webhookServerUrl:'' };

export default function AdminSettings() {
  const [settings, setSettings] = useState(def);
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { getSettings().then(s => { setSettings(s); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const handleSave = () => { saveSettings(settings).then(() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }); };
  const copy = (text: string, f: string) => { navigator.clipboard.writeText(text); setCopiedField(f); setTimeout(() => setCopiedField(''), 2000); };

  if (loading) return <div className="text-gray-400 text-center py-20">Loading settings...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-white">Payment & Webhook Settings</h2>
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-start gap-3"><Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" /><div><p className="text-green-300 text-sm font-medium">Static Payment Page Mode</p><p className="text-green-400/80 text-sm mt-1">No API keys needed! Redirect customers to your Snippe Payment Page. Auto-approval via webhook with HMAC-SHA256 verification.</p></div></div>
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-semibold flex items-center gap-2"><ExternalLink className="w-4 h-4 text-rs-blue" />Payment Page</h3>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Snippe Payment Page URL <a href="https://snippe.sh" target="_blank" className="text-rs-blue text-xs flex items-center gap-0.5 inline-flex ml-1">Create one <ExternalLink className="w-3 h-3" /></a></label><input type="text" value={settings.paymentPageUrl} onChange={e => setSettings({...settings, paymentPageUrl:e.target.value})} placeholder="https://snippe.me/p/Ax7kM2" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rs-blue font-mono text-sm" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Merchant Name</label><input type="text" value={settings.merchantName} onChange={e => setSettings({...settings, merchantName:e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Currency</label><select value={settings.currency} onChange={e => setSettings({...settings, currency:e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue"><option value="USD">USD</option><option value="TZS">TZS</option></select></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Redirect URL</label><input type="text" value={settings.redirectUrl} onChange={e => setSettings({...settings, redirectUrl:e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue font-mono text-sm" /></div>
      </div>
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-semibold flex items-center gap-2"><Webhook className="w-4 h-4 text-rs-blue" />Webhook</h3>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Webhook Secret</label><div className="relative"><input type={showSecret?'text':'password'} value={settings.webhookSecret} onChange={e => setSettings({...settings, webhookSecret:e.target.value})} placeholder="whsec_..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue pr-20 font-mono text-sm" /><button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white">{showSecret?'Hide':'Show'}</button></div></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Webhook URL (public)</label><input type="text" value={settings.webhookUrl} onChange={e => setSettings({...settings, webhookUrl:e.target.value})} placeholder="https://yourserver.com/api/webhooks/snippe" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue font-mono text-sm" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Server URL (for polling)</label><input type="text" value={settings.webhookServerUrl} onChange={e => setSettings({...settings, webhookServerUrl:e.target.value})} placeholder="http://localhost:4000" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue font-mono text-sm" /></div>
        <div className="pt-4 border-t border-gray-800"><button onClick={handleSave} className={`w-full font-semibold py-3 rounded-xl flex items-center justify-center gap-2 ${saved?'bg-green-600 text-white':'bg-rs-blue hover:bg-rs-blue-dark text-white'}`}><Save className="w-5 h-5" />{saved ? 'Saved!' : 'Save Settings'}</button></div>
      </div>
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Terminal className="w-5 h-5 text-rs-blue" />Start the server</h3>
        <div className="bg-gray-950 rounded-lg p-4 relative"><button onClick={() => copy('cd server && npm install && node index.js', 'cmd')} className="absolute top-3 right-3 text-gray-500 hover:text-white">{copiedField==='cmd'?<Check className="w-3 h-3 text-green-400" />:<Copy className="w-3 h-3" />}</button><pre className="text-sm text-green-400 font-mono">cd server && npm install && node index.js</pre></div>
      </div>
    </div>
  );
}
