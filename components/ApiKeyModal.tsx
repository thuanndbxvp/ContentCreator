import React, { useState, useEffect } from 'react';
import { SaveIcon } from './icons/SaveIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onSave: (key: string) => Promise<boolean>;
  onDelete: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, currentApiKey, onSave, onDelete }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(currentApiKey);
      setStatus('idle');
      setError('');
    }
  }, [isOpen, currentApiKey]);

  const handleSave = async () => {
    if (!apiKeyInput.trim()) {
        setError('API Key không được để trống.');
        setStatus('error');
        return;
    }
    setStatus('validating');
    setError('');
    const success = await onSave(apiKeyInput.trim());
    if (success) {
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatus('error');
      setError('API Key không hợp lệ hoặc đã xảy ra lỗi. Vui lòng kiểm tra lại.');
    }
  };

  const handleDelete = () => {
    onDelete();
    setApiKeyInput('');
    setStatus('idle');
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-secondary rounded-lg shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-primary">
          <h2 className="text-xl font-bold text-accent">Cài đặt API Key</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-text-secondary mb-2">
                Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
              placeholder="Nhập API Key của bạn tại đây"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
          </div>
          {status === 'error' && <p className="text-red-400 text-sm">{error}</p>}
          {status === 'success' && <p className="text-green-400 text-sm">Lưu API Key thành công!</p>}
          {currentApiKey && (
              <p className="text-xs text-green-400">
                  Đã có API Key được lưu trữ.
              </p>
          )}
        </div>
        <div className="p-4 border-t border-primary flex justify-between items-center">
            <button
                onClick={handleDelete}
                disabled={!currentApiKey}
                className="flex items-center gap-2 text-sm bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                <TrashIcon className="w-4 h-4" />
                Xóa Key
            </button>
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="text-sm bg-primary/70 hover:bg-primary text-text-secondary font-semibold py-2 px-4 rounded-md transition">
                    Hủy
                </button>
                <button
                    onClick={handleSave}
                    disabled={status === 'validating' || status === 'success'}
                    className="flex items-center gap-2 text-sm bg-accent hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50"
                >
                    {status === 'validating' ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Đang kiểm tra...
                        </>
                    ) : (
                        <>
                          <SaveIcon className="w-5 h-5" />
                          Lưu
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
