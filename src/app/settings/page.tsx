'use client';

import { useState } from 'react';
import { ArrowLeft, User, Bell, Shield, Globe, CreditCard, Building2, FileText, Eye, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchCurrentUser, useFetchVendorDetails } from '@/components/http/QueryHttp';

export default function SettingsPage() {
  const { user: authUser } = useAuth();
  const { data: user } = useFetchCurrentUser();
  const userId = user?.id || authUser?.id || '';
  const { vendor, isPending: vendorLoading } = useFetchVendorDetails(userId);
  
  const [activeTab, setActiveTab] = useState(vendor ? 'vendor' : 'account');
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const [privacy, setPrivacy] = useState({
    profile: 'public',
    orders: 'private',
    reviews: 'public',
  });

  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<Record<string, boolean>>({});

  // Fetch signed URL for document viewing
  const getDocumentUrl = async (originalUrl: string, docKey: string): Promise<string | null> => {
    if (!originalUrl) return null;
    
    // If we already have a signed URL, return it
    if (documentUrls[docKey]) {
      return documentUrls[docKey];
    }

    // If it's already a public URL, use it directly
    if (originalUrl.startsWith('http') && !originalUrl.includes('/sign/')) {
      setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
      return originalUrl;
    }

    setLoadingDocuments((prev) => ({ ...prev, [docKey]: true }));

    try {
      // Use vendor documents endpoint (for vendors viewing their own documents)
      const response = await fetch(`/api/vendor/documents?url=${encodeURIComponent(originalUrl)}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching document URL:', errorData);
        // If vendor endpoint fails, try using the original URL
        setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
        return originalUrl;
      }

      const data = await response.json();
      if (data.url) {
        setDocumentUrls((prev) => ({ ...prev, [docKey]: data.url }));
        return data.url;
      }
      
      setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
      return originalUrl;
    } catch (error) {
      console.error('Error fetching document URL:', error);
      setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
      return originalUrl;
    } finally {
      setLoadingDocuments((prev => ({ ...prev, [docKey]: false })));
    }
  };

  // Handle document view click
  const handleViewDocument = async (originalUrl: string, docKey: string) => {
    const signedUrl = await getDocumentUrl(originalUrl, docKey);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    }
  };

  // Handle document download
  const handleDownloadDocument = async (originalUrl: string, docKey: string, fileName: string) => {
    const signedUrl = await getDocumentUrl(originalUrl, docKey);
    if (signedUrl) {
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('account')}
              className={`${
                activeTab === 'account'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Account Settings
            </button>
            {vendor && (
              <button
                onClick={() => setActiveTab('vendor')}
                className={`${
                  activeTab === 'vendor'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Vendor Profile
              </button>
            )}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`${
                activeTab === 'privacy'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Privacy
            </button>
            <button
              onClick={() => setActiveTab('regional')}
              className={`${
                activeTab === 'regional'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Language & Region
            </button>
          </nav>
        </div>

        <div className="space-y-8">
          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
                <p className="text-gray-600">Manage your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="Demo User"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="user@demo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+234 801 234 5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          )}

          {/* Vendor Profile Tab */}
          {activeTab === 'vendor' && vendor && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Building2 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Vendor Information</h2>
                  <p className="text-gray-600">Your business details and information</p>
                </div>
              </div>

              {vendorLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cover Image Only (Logo removed) */}
                  {vendor.cover_image_url && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {vendor.cover_image_url && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Image
                          </label>
                          <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                            <img
                              src={vendor.cover_image_url}
                              alt="Cover Image"
                              className="w-full h-32 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor ID
                      </label>
                      <input
                        type="text"
                        value={vendor.id || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User ID
                      </label>
                      <input
                        type="text"
                        value={vendor.user_id || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={vendor.business_name || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <input
                        type="text"
                        value={vendor.business_type ? vendor.business_type.charAt(0).toUpperCase() + vendor.business_type.slice(1) : ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Email
                      </label>
                      <input
                        type="email"
                        value={vendor.business_email || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={vendor.phone || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Registration Number
                      </label>
                      <input
                        type="text"
                        value={vendor.business_registration_number || 'Not provided'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax ID
                      </label>
                      <input
                        type="text"
                        value={vendor.tax_id || 'Not provided'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={vendor.address || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={vendor.city || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={vendor.state || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={vendor.country || 'Nigeria'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={vendor.postal_code || 'Not provided'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website URL
                      </label>
                      <input
                        type="text"
                        value={vendor.website_url || 'Not provided'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          vendor.status === 'approved' ? 'bg-green-100 text-green-800' :
                          vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          vendor.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Status
                      </label>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          vendor.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                          vendor.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          vendor.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vendor.verification_status ? vendor.verification_status.charAt(0).toUpperCase() + vendor.verification_status.slice(1) : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {vendor.business_description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description
                      </label>
                      <textarea
                        value={vendor.business_description}
                        readOnly
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  )}

                  {/* Social Media Links */}
                  {vendor.social_media && typeof vendor.social_media === 'object' && Object.keys(vendor.social_media).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Social Media Links
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(vendor.social_media as Record<string, string>).map(([platform, url]) => (
                          <div key={platform}>
                            <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">
                              {platform.replace('_', ' ')}
                            </label>
                            <input
                              type="text"
                              value={url || 'Not provided'}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Statistics */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Products
                        </label>
                        <input
                          type="text"
                          value={vendor.products ? vendor.products.length : 0}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={vendor.rating ? `${parseFloat(vendor.rating).toFixed(2)} / 5.00` : '0.00 / 5.00'}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Reviews
                        </label>
                        <input
                          type="text"
                          value={vendor.total_reviews || 0}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Sales
                        </label>
                        <input
                          type="text"
                          value={vendor.total_sales ? `₦${parseFloat(vendor.total_sales).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₦0.00'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commission Rate
                        </label>
                        <input
                          type="text"
                          value={vendor.commission_rate ? `${parseFloat(vendor.commission_rate).toFixed(2)}%` : '10.00%'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payout Information */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payout Method
                        </label>
                        <input
                          type="text"
                          value={vendor.payout_method ? vendor.payout_method.replace('_', ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Bank Transfer'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>

                      {vendor.payout_details && typeof vendor.payout_details === 'object' && Object.keys(vendor.payout_details).length > 0 && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payout Details
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(vendor.payout_details as Record<string, any>).map(([key, value]) => (
                              <div key={key}>
                                <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </label>
                                <input
                                  type="text"
                                  value={value || 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Accounts */}
                  {vendor.vendor_bank_accounts && Array.isArray(vendor.vendor_bank_accounts) && vendor.vendor_bank_accounts.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Accounts</h3>
                      <div className="space-y-4">
                        {vendor.vendor_bank_accounts.map((account: any, index: number) => (
                          <div key={account.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                {account.is_primary ? 'Primary Account' : `Account ${index + 1}`}
                              </h4>
                              <div className="flex gap-2">
                                {account.is_primary && (
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                    Primary
                                  </span>
                                )}
                                {account.is_verified && (
                                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Account Name
                                </label>
                                <input
                                  type="text"
                                  value={account.account_name || 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Account Number
                                </label>
                                <input
                                  type="text"
                                  value={account.account_number || 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Bank Name
                                </label>
                                <input
                                  type="text"
                                  value={account.bank_name || 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Account Type
                                </label>
                                <input
                                  type="text"
                                  value={account.account_type ? account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1) : 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                                />
                              </div>
                              {account.bank_code && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Bank Code
                                  </label>
                                  <input
                                    type="text"
                                    value={account.bank_code}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-mono"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Account Dates */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Created
                        </label>
                        <input
                          type="text"
                          value={vendor.created_at ? new Date(vendor.created_at).toLocaleDateString('en-NG', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Not available'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Updated
                        </label>
                        <input
                          type="text"
                          value={vendor.updated_at ? new Date(vendor.updated_at).toLocaleDateString('en-NG', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Not available'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

              {/* Documents Section */}
              {vendor.kyc_documents && vendor.kyc_documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Uploaded Documents</h2>
                  <p className="text-gray-600">View and download your business documents</p>
                </div>
              </div>

              <div className="space-y-4">
                {vendor.kyc_documents[0]?.business_license_url && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Business License</h3>
                        <p className="text-sm text-gray-600">Business registration document</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDocument(
                            vendor.kyc_documents![0].business_license_url!,
                            `business_license_${vendor.id}`
                          )}
                          disabled={loadingDocuments[`business_license_${vendor.id}`]}
                          className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingDocuments[`business_license_${vendor.id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(
                            vendor.kyc_documents![0].business_license_url!,
                            `business_license_${vendor.id}`,
                            'business-license.pdf'
                          )}
                          disabled={loadingDocuments[`business_license_${vendor.id}`]}
                          className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingDocuments[`business_license_${vendor.id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {vendor.kyc_documents[0]?.tax_certificate_url && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Tax Certificate</h3>
                        <p className="text-sm text-gray-600">Tax identification document</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDocument(
                            vendor.kyc_documents![0].tax_certificate_url!,
                            `tax_certificate_${vendor.id}`
                          )}
                          disabled={loadingDocuments[`tax_certificate_${vendor.id}`]}
                          className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingDocuments[`tax_certificate_${vendor.id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(
                            vendor.kyc_documents![0].tax_certificate_url!,
                            `tax_certificate_${vendor.id}`,
                            'tax-certificate.pdf'
                          )}
                          disabled={loadingDocuments[`tax_certificate_${vendor.id}`]}
                          className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingDocuments[`tax_certificate_${vendor.id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {vendor.kyc_documents[0]?.bank_statement_url && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Bank Statement</h3>
                        <p className="text-sm text-gray-600">Bank account verification document</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDocument(
                            vendor.kyc_documents![0].bank_statement_url!,
                            `bank_statement_${vendor.id}`
                          )}
                          disabled={loadingDocuments[`bank_statement_${vendor.id}`]}
                          className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingDocuments[`bank_statement_${vendor.id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(
                            vendor.kyc_documents![0].bank_statement_url!,
                            `bank_statement_${vendor.id}`,
                            'bank-statement.pdf'
                          )}
                          disabled={loadingDocuments[`bank_statement_${vendor.id}`]}
                          className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingDocuments[`bank_statement_${vendor.id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {(!vendor.kyc_documents[0]?.business_license_url && 
                  !vendor.kyc_documents[0]?.tax_certificate_url && 
                  !vendor.kyc_documents[0]?.bank_statement_url) && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <p className="text-gray-600">Choose how you want to be notified</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates in your browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via text message</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
                <p className="text-gray-600">Control your privacy settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Visibility
                </label>
                <select
                  value={privacy.profile}
                  onChange={(e) => setPrivacy({ ...privacy, profile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order History
                </label>
                <select
                  value={privacy.orders}
                  onChange={(e) => setPrivacy({ ...privacy, orders: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Reviews
                </label>
                <select
                  value={privacy.reviews}
                  onChange={(e) => setPrivacy({ ...privacy, reviews: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>
          )}

          {/* Language & Region Tab */}
          {activeTab === 'regional' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Language & Region</h2>
                <p className="text-gray-600">Set your preferred language and region</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
            </div>
          </div>
          )}

          {/* Save Button - Show for account, notifications, privacy, and regional tabs */}
          {(activeTab === 'account' || activeTab === 'notifications' || activeTab === 'privacy' || activeTab === 'regional') && (
            <div className="flex justify-end">
              <button className="btn-primary px-8 py-3">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
