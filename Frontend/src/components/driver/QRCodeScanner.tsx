import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { QrCode, Camera, Download, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRCodeScannerProps {
  onScan: (qrData: string) => Promise<void>;
  onClose: () => void;
}

export function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    
    setLoading(true);
    setError(null);
    try {
      await onScan(studentId);
      setSuccess(`Student ${studentId} processed successfully`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to process QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-primary-600" />
            Scan QR Code
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Mode Selection */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setManualMode(false); setError(null); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !manualMode 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera className="h-4 w-4 inline mr-2" />
              Scan QR
            </button>
            <button
              onClick={() => { setManualMode(true); setError(null); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                manualMode 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manual Entry
            </button>
          </div>

          {/* Manual Entry Mode */}
          {manualMode ? (
            <form onSubmit={handleManualSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Student ID
                </label>
                <input
                  type="number"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter student ID number"
                  required
                />
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  {success}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Submit'}
              </Button>
            </form>
          ) : (
            // Camera Scan Mode (placeholder - you'd integrate actual camera scanner here)
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <Camera className="h-16 w-16 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">
                  Camera scanner would open here<br />
                  (Integrate with react-qr-reader or similar)
                </p>
              </div>
              <Button className="w-full" onClick={() => {
                // For demo, simulate scan
                const demoId = prompt('Enter student ID to simulate scan:');
                if (demoId) onScan(demoId);
              }}>
                Simulate Scan
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}