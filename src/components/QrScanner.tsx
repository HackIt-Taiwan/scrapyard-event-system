'use client';

import { useState, useEffect, useRef } from 'react';
import { BarcodeScanner } from '@yudiel/react-qr-scanner';

interface QrScannerProps {
  onScan: (value: string) => void;
  onError: (error: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onError }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check for camera permissions
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        setHasPermission(true);
      })
      .catch((err) => {
        setHasPermission(false);
        onError('Camera permission denied: ' + err.message);
      });
      
    return () => {
      // Cleanup when component unmounts
    };
  }, [onError]);

  if (hasPermission === null) {
    return <div className="text-center p-4">Requesting camera permission...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="text-center p-4 text-red-500">
        Camera access was denied. Please enable camera access and refresh the page.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <BarcodeScanner
        onUpdate={(err, result) => {
          if (result) {
            onScan(result.getText());
          }
          if (err && err.message !== 'No QR code found') {
            onError(err.message);
          }
        }}
        fps={10}
        className="w-full rounded-lg overflow-hidden"
        constraints={{
          facingMode: 'environment',
        }}
      />
      <p className="mt-2 text-sm text-gray-500 text-center">
        Position the QR code in the center of the camera
      </p>
    </div>
  );
};

export default QrScanner; 