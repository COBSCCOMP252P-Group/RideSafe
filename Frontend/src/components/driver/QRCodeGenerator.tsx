import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Download, Printer, QrCode, RefreshCw, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

interface QRCodeGeneratorProps {
  studentId: number;
  studentName: string;
  onClose?: () => void;
}

export function QRCodeGenerator({ studentId, studentName, onClose }: QRCodeGeneratorProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/attendance/qr/generate/${studentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      setQrImage(`data:image/png;base64,${data.qr_image_base64}`);
      setQrToken(data.qr_token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.download = `qr_${studentName}_${studentId}.png`;
    link.href = qrImage;
    link.click();
  };

  const printQR = () => {
    if (!qrImage) return;
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>QR Code - ${studentName}</title>
          <style>
            body { text-align: center; padding: 50px; font-family: Arial, sans-serif; }
            img { max-width: 300px; margin: 20px auto; }
            .info { margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>${studentName}</h2>
          <h3>Student ID: ${studentId}</h3>
          <img src="${qrImage}" />
          <div class="info">
            <p>Scan this QR code for attendance check-in/out</p>
            <p>Student ID: ${studentId}</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow?.document.close();
  };

  const copyToken = () => {
    if (qrToken) {
      navigator.clipboard.writeText(qrToken);
      alert('Student ID copied to clipboard!');
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [studentId]);

  if (loading) {
    return (
      <Card className="text-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary-600" />
        <p>Generating QR Code...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-center p-8">
        <p className="text-red-600 mb-3">{error}</p>
        <Button onClick={generateQRCode}>Try Again</Button>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold flex items-center">
          <QrCode className="h-5 w-5 mr-2 text-primary-600" />
          Student QR Code
        </h2>
      </div>

      <div className="p-6 text-center">
        <div className="mb-6">
          <h3 className="font-bold text-lg">{studentName}</h3>
          <p className="text-gray-600">Student ID: {studentId}</p>
        </div>

        {qrImage && (
          <div className="mb-6">
            <img src={qrImage} alt="QR Code" className="mx-auto w-64 h-64" />
            <div className="mt-3 text-sm text-gray-500">
              <Badge variant="info">Student ID: {qrToken}</Badge>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={downloadQR} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={printQR} variant="outline" className="flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {qrToken && (
            <Button onClick={copyToken} variant="ghost" className="flex items-center">
              <Copy className="h-4 w-4 mr-2" />
              Copy ID
            </Button>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Driver can scan this QR code to mark attendance</p>
          <p>Works for both check-in and check-out</p>
        </div>
      </div>

      {onClose && (
        <div className="p-4 border-t border-gray-200">
          <Button onClick={onClose} variant="ghost" className="w-full">
            Close
          </Button>
        </div>
      )}
    </motion.div>
  );
}