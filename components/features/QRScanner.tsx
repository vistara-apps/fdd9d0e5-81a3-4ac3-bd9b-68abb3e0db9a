'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QrCode, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan?: (data: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export function QRScanner({ onScan, onClose, isOpen = false }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // In a real implementation, you would use a QR code scanning library
      // like @zxing/library or qr-scanner here
      // For demo purposes, we'll simulate scanning after a delay
      setTimeout(() => {
        const mockQRData = `retailrune://product/prod_001?userId=demo_user&location=electronics&timestamp=${Date.now()}`;
        handleScanResult(mockQRData);
      }, 3000);

    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = (data: string) => {
    setScannedData(data);
    setIsScanning(false);
    stopScanning();
    onScan?.(data);
  };

  const handleClose = () => {
    stopScanning();
    setScannedData(null);
    setError(null);
    onClose?.();
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">QR Scanner</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="relative mb-4">
          <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative">
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-accent rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-accent rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-accent rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-accent rounded-br-lg" />
                    
                    {/* Scanning Line Animation */}
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-accent animate-pulse" 
                         style={{
                           animation: 'scan 2s linear infinite',
                         }} />
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-sm bg-black/50 rounded px-3 py-1">
                    Point camera at QR code
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Camera not active</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {scannedData && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-green-400 text-sm font-medium">QR Code Scanned!</p>
            </div>
            <p className="text-text-secondary text-xs break-all">{scannedData}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex space-x-3">
          {!isScanning && !scannedData && (
            <Button
              variant="primary"
              onClick={startScanning}
              className="flex-1"
              disabled={!!error}
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          )}
          
          {isScanning && (
            <Button
              variant="secondary"
              onClick={stopScanning}
              className="flex-1"
            >
              Stop Scanning
            </Button>
          )}
          
          {scannedData && (
            <Button
              variant="primary"
              onClick={() => {
                setScannedData(null);
                startScanning();
              }}
              className="flex-1"
            >
              Scan Again
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-6"
          >
            Close
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-surface/50 rounded-lg">
          <h3 className="text-sm font-medium text-text-primary mb-2">How to use:</h3>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• Allow camera access when prompted</li>
            <li>• Point your camera at a QR code</li>
            <li>• Keep the code within the scanning area</li>
            <li>• The scan will complete automatically</li>
          </ul>
        </div>
      </Card>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}

// QR Code Generator Component (for testing)
export function QRCodeGenerator({ data, size = 200 }: { data: string; size?: number }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // In a real app, you would use a QR code generation library
    // For demo, we'll use a public API
    const generateQR = async () => {
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
        setQrCodeUrl(url);
      } catch (error) {
        console.error('QR generation error:', error);
      }
    };

    if (data) {
      generateQR();
    }
  }, [data, size]);

  if (!qrCodeUrl) {
    return (
      <div 
        className="bg-gray-200 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <QrCode className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="text-center">
      <img 
        src={qrCodeUrl} 
        alt="QR Code"
        className="rounded-lg border border-gray-300"
        width={size}
        height={size}
      />
      <p className="text-xs text-text-secondary mt-2 break-all max-w-xs">
        {data}
      </p>
    </div>
  );
}
