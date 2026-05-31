import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Trash2, ArrowLeft, Upload, FileCheck, X } from 'lucide-react';
import { getRobot, saveRobot, deleteRobot, generateId, saveEAFile, getEAFile, formatFileSize } from '../store';
import { apiUploadProductFile } from '../api';
import { Robot } from '../types';

const empty: Robot = { id:'', name:'', description:'', price:0, image:'', category:'Scalper', strategy:'', pairs:[], timeframe:'', win_rate:0, drawdown:0, specs:[], in_stock:true, featured:false, file_name:'', file_type:'', file_size:0, version:'v1.0.0', created_at:'' };

export default function AdminUpload() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('id');
  const fileRef = useRef<HTMLInputElement>(null);
  const [robot, setRobot] = useState<Robot>({ ...empty, id: generateId() });
  const [specsText, setSpecsText] = useState('');
  const [pairsText, setPairsText] = useState('');
  const [saved, setSaved] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasExistingFile, setHasExistingFile] = useState<any>(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      getRobot(editId).then(found => {
        if (found) { setRobot(found); setSpecsText((found.specs||[]).join('\n')); setPairsText((found.pairs||[]).join(', ')); setIsEdit(true); }
        setLoading(false);
      }).catch(() => setLoading(false));
      getEAFile(editId).then(info => setHasExistingFile(info)).catch(() => {});
    }
  }, [editId]);

  if (loading) return <div className="text-gray-400 text-center py-20">Loading EA data...</div>;

  const handleSave = async () => {
    if (!robot.name || !robot.description || robot.price <= 0) { alert('Fill required fields.'); return; }
    setUploading(true);
    try {
      const toSave = { ...robot, pairs: pairsText.split(',').map(p=>p.trim()).filter(Boolean), specs: specsText.split('\n').filter(s=>s.trim()), created_at: robot.created_at || new Date().toISOString() };
      if (selectedFile) {
        toSave.file_name = selectedFile.name;
        toSave.file_size = selectedFile.size;
      }
      await saveRobot(toSave);
      if (selectedFile) await apiUploadProductFile(toSave.id, selectedFile);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { alert('Save failed: ' + e.message); }
    setUploading(false);
  };

  const handleDelete = () => { if (isEdit && confirm('Delete this EA?')) { deleteRobot(editId!); navigate('/admin'); } };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div><button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2"><ArrowLeft className="w-4 h-4" />Back</button><h2 className="text-xl font-bold text-white">{isEdit?'Edit':'Add'} EA</h2></div>
        {isEdit && <button onClick={handleDelete} className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg"><Trash2 className="w-4 h-4" />Delete</button>}
      </div>
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">EA Name *</label><input type="text" value={robot.name} onChange={e=>setRobot({...robot,name:e.target.value})} placeholder="Golden Scalper EA" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label><textarea value={robot.description} onChange={e=>setRobot({...robot,description:e.target.value})} placeholder="Describe the EA..." rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue resize-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Price (USD) *</label><input type="number" value={robot.price||''} onChange={e=>setRobot({...robot,price:Number(e.target.value)})} placeholder="299" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label><select value={robot.category} onChange={e=>setRobot({...robot,category:e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue"><option>Scalper</option><option>Trend Following</option><option>Grid</option><option>Breakout</option><option>Martingale</option><option>Hedging</option></select></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Win Rate %</label><input type="number" step="0.1" value={robot.win_rate||''} onChange={e=>setRobot({...robot,win_rate:Number(e.target.value)})} placeholder="78.5" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Max DD %</label><input type="number" step="0.1" value={robot.drawdown||''} onChange={e=>setRobot({...robot,drawdown:Number(e.target.value)})} placeholder="12.3" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Timeframe</label><input type="text" value={robot.timeframe} onChange={e=>setRobot({...robot,timeframe:e.target.value})} placeholder="M5/M15" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Pairs (comma-separated)</label><input type="text" value={pairsText} onChange={e=>setPairsText(e.target.value)} placeholder="EURUSD, GBPUSD, XAUUSD" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue font-mono text-sm" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Image URL</label><input type="text" value={robot.image} onChange={e=>setRobot({...robot,image:e.target.value})} placeholder="/images/robot-1.jpg" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" /></div>
        <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Features (per line)</label><textarea value={specsText} onChange={e=>setSpecsText(e.target.value)} placeholder="Feature 1\nFeature 2" rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue resize-none font-mono text-sm" /></div>
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">EA File (.ex5/.ex4) *</label>
          {(hasExistingFile?.hasFile || robot.file_name) && !selectedFile && <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4 mb-3 flex items-center justify-between"><div className="flex items-center gap-3"><FileCheck className="w-5 h-5 text-green-400" /><div><p className="text-white text-sm font-medium">{robot.file_name}</p><p className="text-gray-500 text-xs">{robot.file_size ? formatFileSize(robot.file_size) : ''} • Uploaded</p></div></div><button onClick={async()=>{setRobot({...robot,file_name:'',file_size:0}); setHasExistingFile(null)}} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"><X className="w-3 h-3"/>Remove</button></div>}
          {selectedFile && <div className="bg-blue-500/5 border border-blue-500/30 rounded-lg p-4 mb-3 flex items-center justify-between"><div className="flex items-center gap-3"><Upload className="w-5 h-5 text-blue-400" /><div><p className="text-white text-sm font-medium">{selectedFile.name}</p><p className="text-gray-500 text-xs">{formatFileSize(selectedFile.size)} • Ready</p></div></div><button onClick={()=>{setSelectedFile(null);if(fileRef.current)fileRef.current.value=''}} className="text-red-400 text-xs flex items-center gap-1"><X className="w-3 h-3"/>Cancel</button></div>}
          <input ref={fileRef} type="file" accept=".ex5,.ex4,.mq5,.mq4" onChange={e=>{const f=e.target.files?.[0];if(f){const ext=f.name.substring(f.name.lastIndexOf('.')).toLowerCase();if(!['.ex5','.ex4','.mq5','.mq4'].includes(ext)){alert('Invalid file type');return;}if(f.size>10*1024*1024){alert('Max 10MB');return;}setSelectedFile(f)}}} className="hidden" />
          <button type="button" onClick={()=>fileRef.current?.click()} className="w-full border-2 border-dashed border-gray-700 hover:border-rs-blue/50 rounded-lg p-6 text-center transition-colors group">
            <Upload className="w-8 h-8 text-gray-600 group-hover:text-rs-blue mx-auto mb-2" />
            <p className="text-gray-400 text-sm">{hasExistingFile||robot.file_name?'Replace file':'Click to upload .ex5 / .ex4'}</p>
            <p className="text-gray-600 text-xs mt-1">Accepts .ex5, .ex4, .mq5, .mq4 — Max 10MB</p>
          </button>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={robot.in_stock} onChange={e=>setRobot({...robot,in_stock:e.target.checked})} className="w-4 h-4 rounded" /><span className="text-sm text-gray-300">In Stock</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={robot.featured} onChange={e=>setRobot({...robot,featured:e.target.checked})} className="w-4 h-4 rounded" /><span className="text-sm text-gray-300">Featured</span></label>
        </div>
        <button onClick={handleSave} disabled={uploading} className={`w-full font-semibold py-3 rounded-xl flex items-center justify-center gap-2 ${saved?'bg-green-600 text-white':uploading?'bg-gray-700 text-gray-400 cursor-not-allowed':'bg-rs-blue hover:bg-rs-blue-dark text-white'}`}><Save className="w-5 h-5" />{uploading?'Saving...':saved?'Saved!':isEdit?'Update':'Add EA'}</button>
      </div>
    </div>
  );
}
