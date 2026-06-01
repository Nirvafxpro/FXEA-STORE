import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Trash2, ArrowLeft, Upload, FileCheck, X, Image as ImageIcon } from 'lucide-react';
import { getRobot, saveRobot, deleteRobot, generateId, saveEAFile, getEAFile, formatFileSize, saveImageFile } from '../store';
import { Robot } from '../types';

const empty: Robot = { 
  id: '', 
  name: '', 
  description: '', 
  price: 0, 
  image: '', 
  category: 'Scalper', 
  strategy: '', 
  pairs: [], 
  timeframe: '', 
  win_rate: 0, 
  drawdown: 0, 
  specs: [], 
  in_stock: true, 
  featured: false, 
  file_name: '', 
  file_size: 0, 
  version: 'v1.0.0', 
  created_at: '' 
};

export default function AdminUpload() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('id');
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  
  const [robot, setRobot] = useState<Robot>({ ...empty, id: generateId() });
  const [specsText, setSpecsText] = useState('');
  const [pairsText, setPairsText] = useState('');
  const [saved, setSaved] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Files
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [hasExistingFile, setHasExistingFile] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      getRobot(editId).then(found => {
        if (found) {
          setRobot(found);
          setSpecsText((found.specs || []).join('\n'));
          setPairsText((found.pairs || []).join(', '));
          setImagePreview(found.image || '');
          setIsEdit(true);
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
      getEAFile(editId).then(info => setHasExistingFile(info)).catch(() => {});
    }
  }, [editId]);

  // Image preview
  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedImage);
    }
  }, [selectedImage]);

  if (loading) return <div className="text-gray-400 text-center py-20">Loading EA data...</div>;

  const handleSave = async () => {
    setError('');
    
    if (!robot.name || !robot.description || robot.price <= 0) {
      setError('Fill all required fields (Name, Description, Price)');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // Upload image if selected
      let imageUrl = robot.image;
      if (selectedImage) {
        try {
          imageUrl = await saveImageFile(selectedImage);
          console.log('Image uploaded:', imageUrl);
        } catch (imgErr) {
          console.error('Image upload error:', imgErr);
          setError('Failed to upload image. Check storage policies.');
          setUploading(false);
          return;
        }
      }
      
      // Upload EA file if selected
      if (selectedFile) {
        try {
          await saveEAFile(robot.id, selectedFile);
          robot.file_name = selectedFile.name;
          robot.file_size = selectedFile.size;
        } catch (fileErr) {
          console.error('EA file upload error:', fileErr);
          setError('Failed to upload EA file. Check storage policies.');
          setUploading(false);
          return;
        }
      }
      
      // Save product data
      const toSave: Partial<Robot> & { id: string } = {
        ...robot,
        image: imageUrl,
        pairs: pairsText.split(',').map(p => p.trim()).filter(Boolean),
        specs: specsText.split('\n').filter(s => s.trim()),
        created_at: robot.created_at || new Date().toISOString(),
        file_name: selectedFile ? selectedFile.name : robot.file_name,
        file_size: selectedFile ? selectedFile.size : robot.file_size,
      };
      
      await saveRobot(toSave);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Reset selected files
      setSelectedFile(null);
      setSelectedImage(null);
      if (fileRef.current) fileRef.current.value = '';
      if (imageRef.current) imageRef.current.value = '';
      
    } catch (e: any) {
      console.error('Save error:', e);
      setError(e.message || 'Failed to save. Please try again.');
    }
    
    setUploading(false);
  };

  const handleDelete = async () => {
    if (isEdit && confirm('Delete this EA? This cannot be undone.')) {
      try {
        await deleteRobot(editId!);
        navigate('/admin');
      } catch (err) {
        alert('Failed to delete. Try again.');
      }
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit' : 'Add'} EA</h2>
        </div>
        {isEdit && (
          <button onClick={handleDelete} className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/20">
            <Trash2 className="w-4 h-4" />Delete
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {saved && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
          ✓ Product saved successfully!
        </div>
      )}

      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-5">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">EA Name *</label>
          <input 
            type="text" 
            value={robot.name} 
            onChange={e => setRobot({ ...robot, name: e.target.value })} 
            placeholder="Golden Scalper EA" 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label>
          <textarea 
            value={robot.description} 
            onChange={e => setRobot({ ...robot, description: e.target.value })} 
            placeholder="Describe the EA..." 
            rows={3} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue resize-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Price (USD) *</label>
            <input 
              type="number" 
              value={robot.price || ''} 
              onChange={e => setRobot({ ...robot, price: Number(e.target.value) })} 
              placeholder="299" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
            <select 
              value={robot.category} 
              onChange={e => setRobot({ ...robot, category: e.target.value })} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue"
            >
              <option>Scalper</option>
              <option>Trend Following</option>
              <option>Grid</option>
              <option>Breakout</option>
              <option>Martingale</option>
              <option>Hedging</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Win Rate %</label>
            <input 
              type="number" 
              step="0.1" 
              value={robot.win_rate || ''} 
              onChange={e => setRobot({ ...robot, win_rate: Number(e.target.value) })} 
              placeholder="78.5" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Max DD %</label>
            <input 
              type="number" 
              step="0.1" 
              value={robot.drawdown || ''} 
              onChange={e => setRobot({ ...robot, drawdown: Number(e.target.value) })} 
              placeholder="12.3" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Timeframe</label>
            <input 
              type="text" 
              value={robot.timeframe} 
              onChange={e => setRobot({ ...robot, timeframe: e.target.value })} 
              placeholder="M5/M15" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Pairs (comma-separated)</label>
          <input 
            type="text" 
            value={pairsText} 
            onChange={e => setPairsText(e.target.value)} 
            placeholder="EURUSD, GBPUSD, XAUUSD" 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue font-mono text-sm" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Features (per line)</label>
          <textarea 
            value={specsText} 
            onChange={e => setSpecsText(e.target.value)} 
            placeholder="Feature 1&#10;Feature 2" 
            rows={4} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rs-blue resize-none font-mono text-sm" 
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Product Image</label>
          
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-40 object-cover rounded-lg border border-gray-700"
              />
              <button
                onClick={() => {
                  setImagePreview('');
                  setSelectedImage(null);
                  setRobot({ ...robot, image: '' });
                  if (imageRef.current) imageRef.current.value = '';
                }}
                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <input 
            ref={imageRef} 
            type="file" 
            accept="image/*" 
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  alert('Image must be less than 5MB');
                  return;
                }
                setSelectedImage(file);
              }
            }} 
            className="hidden" 
          />
          
          <button 
            type="button" 
            onClick={() => imageRef.current?.click()} 
            className="w-full border-2 border-dashed border-gray-700 hover:border-rs-blue/50 rounded-lg p-4 text-center transition-colors group flex items-center justify-center gap-2"
          >
            <ImageIcon className="w-5 h-5 text-gray-500 group-hover:text-rs-blue" />
            <span className="text-gray-400 text-sm">{imagePreview ? 'Change Image' : 'Upload Image'}</span>
          </button>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP. Max 5MB</p>
        </div>

        {/* EA File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">EA File (.ex5/.ex4) *</label>
          
          {(hasExistingFile?.hasFile || robot.file_name) && !selectedFile && (
            <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white text-sm font-medium">{robot.file_name}</p>
                  <p className="text-gray-500 text-xs">{robot.file_size ? formatFileSize(robot.file_size) : ''} • Uploaded</p>
                </div>
              </div>
              <button 
                onClick={() => { setRobot({ ...robot, file_name: '', file_size: 0 }); setHasExistingFile(null); }} 
                className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
              >
                <X className="w-3 h-3" />Remove
              </button>
            </div>
          )}
          
          {selectedFile && (
            <div className="bg-blue-500/5 border border-blue-500/30 rounded-lg p-4 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-gray-500 text-xs">{formatFileSize(selectedFile.size)} • Ready</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = ''; }} 
                className="text-red-400 text-xs flex items-center gap-1"
              >
                <X className="w-3 h-3" />Cancel
              </button>
            </div>
          )}
          
          <input 
            ref={fileRef} 
            type="file" 
            accept=".ex5,.ex4,.mq5,.mq4" 
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (!['.ex5', '.ex4', '.mq5', '.mq4'].includes(ext)) {
                  alert('Invalid file type. Only .ex5, .ex4, .mq5, .mq4 allowed');
                  return;
                }
                if (file.size > 10 * 1024 * 1024) {
                  alert('File must be less than 10MB');
                  return;
                }
                setSelectedFile(file);
              }
            }} 
            className="hidden" 
          />
          
          <button 
            type="button" 
            onClick={() => fileRef.current?.click()} 
            className="w-full border-2 border-dashed border-gray-700 hover:border-rs-blue/50 rounded-lg p-6 text-center transition-colors group"
          >
            <Upload className="w-8 h-8 text-gray-600 group-hover:text-rs-blue mx-auto mb-2" />
            <p className="text-gray-400 text-sm">{hasExistingFile || robot.file_name ? 'Replace file' : 'Click to upload .ex5 / .ex4'}</p>
            <p className="text-gray-600 text-xs mt-1">Accepts .ex5, .ex4, .mq5, .mq4 — Max 10MB</p>
          </button>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={robot.in_stock} 
              onChange={e => setRobot({ ...robot, in_stock: e.target.checked })} 
              className="w-4 h-4 rounded" 
            />
            <span className="text-sm text-gray-300">In Stock</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={robot.featured} 
              onChange={e => setRobot({ ...robot, featured: e.target.checked })} 
              className="w-4 h-4 rounded" 
            />
            <span className="text-sm text-gray-300">Featured</span>
          </label>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSave} 
          disabled={uploading} 
          className={`w-full font-semibold py-3 rounded-xl flex items-center justify-center gap-2 ${
            saved ? 'bg-green-600 text-white' :
            uploading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
            'bg-rs-blue hover:bg-rs-blue-dark text-white'
          }`}
        >
          <Save className="w-5 h-5" />
          {uploading ? 'Saving...' : saved ? 'Saved!' : isEdit ? 'Update' : 'Add EA'}
        </button>
      </div>
    </div>
  );
}
