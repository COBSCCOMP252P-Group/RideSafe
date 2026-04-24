import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '../ui/Button';
import { X, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface RealQRScannerProps {
  onScan: (qrData: string) => Promise<void>;
  onClose: () => void;
  actionType: 'checkin' | 'checkout';
}

export function RealQRScanner({ onScan, onClose, actionType }: RealQRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (scannerRef.current && !scanner) {
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      qrScanner.render(
        async (decodedText) => {
          // ✅ QR CODE SCANNED SUCCESSFULLY!
          console.log("✅ QR Code scanned:", decodedText);
          if (!scanning) {
            setScanning(true);
            await onScan(decodedText); // decodedText = student ID (e.g., "1")
            qrScanner.clear();
            onClose();
          }
        },
        (errorMessage) => {
          // Scanning in progress, ignore errors
          console.log("Scanning...");
        }
      );

      setScanner(qrScanner);

      return () => {
        if (qrScanner) {
          qrScanner.clear().catch(console.error);
        }
      };
    }
  }, [scanner, onScan, scanning, onClose]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <h2 className="text-lg font-bold flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Scan QR Code - {actionType === 'checkin' ? 'Check In' : 'Check Out'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-primary-500 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div id="qr-reader" ref={scannerRef} className="w-full"></div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              Position the QR code in front of the camera
            </p>
          </div>

          <Button onClick={onClose} variant="outline" className="w-full mt-4">
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
}