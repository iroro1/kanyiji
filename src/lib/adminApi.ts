// Admin API utility functions

export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  pendingProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch('/api/admin/stats', {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch admin stats');
  }
  const data = await response.json();
  return data.stats;
}

export async function fetchVendors(page = 1, limit = 10, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`/api/admin/vendors?${params}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch vendors');
  }
  return response.json();
}

export async function createVendor(vendorData: any) {
  const response = await fetch('/api/admin/vendors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(vendorData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create vendor');
  }

  return response.json();
}

export async function updateVendor(vendorId: string, action: string, updates?: any) {
  const response = await fetch('/api/admin/vendors', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      vendorId,
      action,
      ...updates,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update vendor');
  }

  return response.json();
}

export async function deleteVendor(vendorId: string) {
  const response = await fetch(`/api/admin/vendors?id=${vendorId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete vendor');
  }

  return response.json();
}

export async function fetchProducts(page = 1, limit = 10, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`/api/admin/products?${params}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function createProduct(productData: any) {
  const response = await fetch('/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create product');
  }

  return response.json();
}

export async function updateProduct(productId: string, action: string, updates?: any) {
  const response = await fetch('/api/admin/products', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      productId,
      action,
      ...updates,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update product');
  }

  return response.json();
}

export async function deleteProduct(productId: string) {
  const response = await fetch(`/api/admin/products?id=${productId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete product');
  }

  return response.json();
}

export async function fetchOrders(page = 1, limit = 10, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`/api/admin/orders?${params}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

export async function createOrder(orderData: any) {
  const response = await fetch('/api/admin/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
}

export async function updateOrder(orderId: string, status?: string, updates?: any) {
  const response = await fetch('/api/admin/orders', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      orderId,
      status,
      ...updates,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order');
  }

  return response.json();
}

export async function deleteOrder(orderId: string) {
  const response = await fetch(`/api/admin/orders?id=${orderId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete order');
  }

  return response.json();
}

export async function fetchUsers(page = 1, limit = 10, role?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (role) {
    params.append('role', role);
  }

  const response = await fetch(`/api/admin/users?${params}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function createUser(userData: any) {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }

  return response.json();
}

export async function updateUser(userId: string, action: string, updates?: any) {
  const response = await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      userId,
      action,
      ...updates,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }

  return response.json();
}

export async function deleteUser(userId: string) {
  const response = await fetch(`/api/admin/users?id=${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }

  return response.json();
}

export async function fetchCategories() {
  const response = await fetch('/api/admin/categories', {
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch categories');
  }
  const data = await response.json();
  console.log('Categories API response:', data);
  return data.categories || [];
}

