import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthUser } from '@/services/authService';

export const useAuthState = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isVendor, setIsVendor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {
    if (user) {
      setIsVendor(user.role === 'vendor');
      setIsAdmin(user.role === 'admin');
      setIsCustomer(user.role === 'customer');
    } else {
      setIsVendor(false);
      setIsAdmin(false);
      setIsCustomer(false);
    }
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isVendor,
    isAdmin,
    isCustomer,
    hasRole: (role: 'customer' | 'vendor' | 'admin') => user?.role === role,
    hasAnyRole: (roles: Array<'customer' | 'vendor' | 'admin'>) => 
      user ? roles.includes(user.role) : false,
  };
};
