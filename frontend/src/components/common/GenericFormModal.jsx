import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../../services/api';
import { AlertCircle } from 'lucide-react';

const GenericFormModal = ({ isOpen, onClose, title, fields, initialData, endpoint, onSuccess, method = 'POST' }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creatingField, setCreatingField] = useState(null);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [creatingLoading, setCreatingLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        const initial = {};
        fields.forEach(f => {
          initial[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
        });
        setFormData(initial);
      }
      setError(null);
      setCreatingField(null);
      setNewOptionValue('');
    }
  }, [isOpen, initialData, fields]);

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    // Auto-extract real image URLs if they paste a Google/Bing wrapper link
    if (name === 'imageUrl' && value) {
      try {
        if (value.includes('google.com/imgres')) {
          const urlParams = new URL(value).searchParams;
          if (urlParams.has('imgurl')) value = urlParams.get('imgurl');
        } else if (value.includes('bing.com/images/search')) {
          const urlParams = new URL(value).searchParams;
          if (urlParams.has('mediaurl')) value = urlParams.get('mediaurl');
        }
      } catch (err) {
        // Ignore parsing errors and keep original value
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (method === 'POST') {
        await api.post(endpoint, formData);
      } else if (method === 'PUT') {
        await api.put(`${endpoint}/${initialData._id}`, formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl flex items-center space-x-2 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(field => (
            <div key={field.name} className={`space-y-1 ${field.fullWidth ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                {field.onCreateNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingField(creatingField === field.name ? null : field.name);
                      setNewOptionValue('');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {creatingField === field.name ? 'Cancel' : `+ New ${field.label}`}
                  </button>
                )}
              </div>
              
              {field.type === 'select' ? (
                creatingField === field.name ? (
                  <div className="flex items-center space-x-2 pt-0.5">
                    <input
                      type="text"
                      placeholder={`Enter new ${field.label.toLowerCase()}...`}
                      value={newOptionValue}
                      onChange={(e) => setNewOptionValue(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!newOptionValue.trim()) return;
                          setCreatingLoading(true);
                          const newId = await field.onCreateNew(newOptionValue.trim());
                          setCreatingLoading(false);
                          if (newId) {
                            setFormData(prev => ({ ...prev, [field.name]: newId }));
                            setCreatingField(null);
                            setNewOptionValue('');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-blue-400 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      autoFocus
                    />
                    <button
                      type="button"
                      disabled={creatingLoading || !newOptionValue.trim()}
                      onClick={async () => {
                        if (!newOptionValue.trim()) return;
                        setCreatingLoading(true);
                        const newId = await field.onCreateNew(newOptionValue.trim());
                        setCreatingLoading(false);
                        if (newId) {
                          setFormData(prev => ({ ...prev, [field.name]: newId }));
                          setCreatingField(null);
                          setNewOptionValue('');
                        }
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      {creatingLoading ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                ) : (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => {
                      if (e.target.value === '__CREATE_NEW__') {
                        setCreatingField(field.name);
                        setNewOptionValue('');
                        return;
                      }
                      handleChange(e);
                    }}
                    required={field.required}
                    disabled={field.disabled}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                  >
                    <option value="">Select {field.label}...</option>
                    {field.options && field.options.length > 0 ? (
                      field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))
                    ) : (
                      <option value="" disabled>No {field.label.toLowerCase()} found</option>
                    )}
                    {field.onCreateNew && (
                      <option value="__CREATE_NEW__" className="font-bold text-blue-600 bg-blue-50">
                        + Add New {field.label}...
                      </option>
                    )}
                  </select>
                )
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  disabled={field.disabled}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm resize-none"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  disabled={field.disabled}
                  step={field.type === 'number' ? 'any' : undefined}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                />
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 disabled:opacity-70 transition-all flex items-center"
          >
            {loading ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GenericFormModal;
