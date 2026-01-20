import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  timeout?: number; // Maximum time to show spinner (default: 5 seconds)
  onTimeout?: () => void; // Callback when timeout is reached
}

export default function LoadingSpinner({ timeout = 5000, onTimeout }: LoadingSpinnerProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (!show) {
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
