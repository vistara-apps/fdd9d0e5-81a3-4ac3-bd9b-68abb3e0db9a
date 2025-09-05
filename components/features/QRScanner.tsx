'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Camera, X, Zap } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QRScanner({ onScan, onError, isOpen, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, isScanning]);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start QR code detection
      startQRDetection();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startQRDetection = () => {
    // In a real implementation, you would use a QR code detection library
    // For now, we'll simulate QR code detection
    const detectQR = () => {
      if (!isScanning || !videoRef.current) return;

      // Simulate QR code detection
      // In production, use libraries like jsQR or qr-scanner
      setTimeout(() => {
        if (Math.random() > 0.95) { // 5% chance to "detect" a QR code
          const mockQRData = JSON.stringify({
            type: 'store_scan',
            storeId: 'demo_store_001',
            location: 'Electronics Section',
            timestamp: new Date().toISOString(),
          });
          
          onScan(mockQRData);
          setIsScanning(false);
          onClose();
        } else {
          requestAnimationFrame(detectQR);
        }
      }, 100);
    };

    requestAnimationFrame(detectQR);
  };

  const handleStartScanning = () => {
    setIsScanning(true);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    stopCamera();
  };

  const handleClose = () => {
    handleStopScanning();
    onClose();
  };

  const handleManualInput = () => {
    // For demo purposes, simulate a successful scan
    const mockQRData = JSON.stringify({
      type: 'store_scan',
      storeId: 'demo_store_001',
      location: 'Demo Location',
      timestamp: new Date().toISOString(),
    });
    
    onScan(mockQRData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Scan QR Code">
      <div className="space-y-6">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <div className="p-4 bg-primary/20 rounded-full w-fit mx-auto">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Scan Store QR Code
          </h3>
          <p className="text-text-secondary">
            Point your camera at the QR code to get personalized recommendations
          </p>
        </div>

        {/* Camera View */}
        {isScanning && (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-surface rounded-lg object-cover"
              playsInline
              muted
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                
                {/* Scanning line animation */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          {!isScanning ? (
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleStartScanning}
                className="w-full"
                disabled={!!error}
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Camera
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleManualInput}
                className="w-full"
              >
                <Zap className="w-5 h-5 mr-2" />
                Demo Scan (Skip Camera)
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={handleStopScanning}
              className="w-full"
            >
              <X className="w-5 h-5 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="bg-surface/50 rounded-lg p-4">
          <h4 className="font-medium text-text-primary mb-2">Tips for better scanning:</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Hold your device steady</li>
            <li>• Ensure good lighting</li>
            <li>• Keep the QR code within the frame</li>
            <li>• Move closer or further if needed</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
