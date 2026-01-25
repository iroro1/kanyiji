import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  timeout?: number; // Max time before "taking longer" message (default: 5s). Use 0 to never timeout.
  onTimeout?: () => void;
}

export default function LoadingSpinner({ timeout = 5000, onTimeout }: LoadingSpinnerProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (timeout <= 0) return;
    const timer = setTimeout(() => {
      setShow(false);
      onTimeout?.();
    }, timeout);
    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (timeout > 0 && !show) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading is taking longer than expected. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );
}
