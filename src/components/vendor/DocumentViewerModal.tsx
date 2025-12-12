"use client";

import { X, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string | null;
  documentName?: string;
  onDownload?: () => void;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  documentUrl,
  documentName = "Document",
  onDownload,
}: DocumentViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen && documentUrl) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, documentUrl]);

  if (!isOpen || !documentUrl) return null;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Determine if it's a PDF based on URL or file extension
  const isPdf = documentUrl.toLowerCase().includes('.pdf') || 
                documentUrl.toLowerCase().includes('application/pdf') ||
                documentUrl.toLowerCase().includes('pdf');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium text-gray-900">
                {documentName}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-100 p-4">
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading document...</p>
                </div>
              </div>
            )}

            {hasError && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <p className="text-red-600 mb-4">Failed to load document</p>
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                      // Force reload by updating the iframe src
                      const iframe = document.getElementById('document-iframe') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = iframe.src;
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <div className={`bg-white rounded-lg overflow-hidden ${isLoading || hasError ? 'hidden' : ''}`}>
              {isPdf ? (
                <iframe
                  id="document-iframe"
                  src={documentUrl}
                  className="w-full h-[calc(100vh-200px)] min-h-[600px]"
                  onLoad={handleLoad}
                  onError={handleError}
                  title={documentName}
                />
              ) : (
                <div className="w-full h-[calc(100vh-200px)] min-h-[600px] flex items-center justify-center">
                  <iframe
                    id="document-iframe"
                    src={documentUrl}
                    className="w-full h-full"
                    onLoad={handleLoad}
                    onError={handleError}
                    title={documentName}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

