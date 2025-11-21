'use client';

import { usePathname } from 'next/navigation';
import AdminNavbar from '@/components/layout/AdminNavbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && <AdminNavbar />}
      <main className={!isLoginPage ? 'pt-16' : ''}>
        {children}
      </main>
      {/* No Footer - Admin pages don't need the main site footer */}
    </div>
  );
}
