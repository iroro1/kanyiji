'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Shield, Lock } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const adminSession = localStorage.getItem('adminSession');
    
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        if (session.isAuthenticated && session.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          // Invalid session, redirect to login
          router.push('/admin/login');
        }
      } catch (error) {
        // Invalid session data, redirect to login
        router.push('/admin/login');
      }
    } else {
      // No session, redirect to login
      router.push('/admin/login');
    }
    
    setIsLoading(false);
  }, [router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Access</h2>
          <p className="text-gray-600">Checking admin credentials...</p>
        </div>
      </div>
    );
  }

  // Show admin dashboard if authenticated
  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  // This should not be reached due to redirect, but fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Redirecting to admin login...</p>
      </div>
    </div>
  );
}
