"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Settings,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import PasswordChangeModal from "@/components/settings/PasswordChangeModal";
import NotificationsSettings from "@/components/settings/NotificationsSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import DeleteAccountModal from "@/components/settings/DeleteAccountModal";
import { useFetchVendorDetails, useFetchCurrentUser } from "@/components/http/QueryHttp";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { data: currentUser } = useFetchCurrentUser();
  const userId = currentUser?.id || user?.id || "";
  const { vendor, isPending: vendorLoading } = useFetchVendorDetails(userId);
  const { notify } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const hasFetchedRef = useRef<string | null>(null); // Track last successfully fetched user ID to prevent re-fetch on tab switch
  const hasInitialLoadRef = useRef<boolean>(false); // Track if initial load has completed
  const sessionStorageKey = 'kanyiji_profile_data'; // SessionStorage key for profile data
  
  // Helper function to get profile data from sessionStorage
  const getProfileFromSession = (userId: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = sessionStorage.getItem(sessionStorageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.userId === userId && data.profileData) {
          return data.profileData;
        }
      }
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
    }
    return null;
  };
  
  // Helper function to save profile data to sessionStorage
  const saveProfileToSession = (userId: string, profileData: any) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(sessionStorageKey, JSON.stringify({
        userId,
        profileData,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  };
  
  // Helper function to clear profile data from sessionStorage
  const clearProfileFromSession = () => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(sessionStorageKey);
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  };
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingVendor, setIsSavingVendor] = useState(false);

  // Settings modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // User data from database
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nigeria",
    avatar_url: "",
  });

  // Helper function to check if user is logged in with Google OAuth
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // Check if user is Google OAuth user by getting raw Supabase user
  useEffect(() => {
    const checkGoogleUser = async () => {
      try {
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();
        const isGoogle =
          supabaseUser?.app_metadata?.provider === "google" ||
          supabaseUser?.user_metadata?.provider === "google" ||
          supabaseUser?.identities?.some(
            (identity: any) => identity.provider === "google"
          );

        setIsGoogleUser(isGoogle ? isGoogle : false);
      } catch (error) {
        console.error("Error checking Google user:", error);
        setIsGoogleUser(false);
      }
    };

    if (user) {
      checkGoogleUser();
    }
  }, [user]);

  const [formData, setFormData] = useState({
    ...userData,
    avatar_url: "",
  });
  
  // Vendor form data
  const [vendorFormData, setVendorFormData] = useState<any>({});

  // Initialize vendor form data when vendor is loaded
  useEffect(() => {
    if (vendor) {
      // Also get user email as fallback for business_email
      const userEmail = currentUser?.email || user?.email || "";
      
      setVendorFormData({
        business_name: vendor.business_name || "",
        business_type: vendor.business_type || "",
        business_description: vendor.business_description || "",
        business_email: vendor.business_email || userEmail || "",
        phone: vendor.phone || "",
        business_registration_number: vendor.business_registration_number || "",
        tax_id: vendor.tax_id || "",
        address: vendor.address || "",
        city: vendor.city || "",
        state: vendor.state || "",
        country: vendor.country || "Nigeria",
        postal_code: vendor.postal_code || "",
        website_url: vendor.website_url || "",
        social_media: vendor.social_media || {},
      });
    }
  }, [vendor]);

  // Fetch user profile data from database - ONLY ONCE when user is available
  // Use sessionStorage to persist data across tab switches within the same session
  useEffect(() => {
    // Don't fetch if not authenticated or user ID not available yet
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      hasInitialLoadRef.current = true;
      return;
    }

    const userId = user.id; // Extract user ID once to prevent dependency issues
    
    // CHECK SESSIONSTORAGE FIRST - Load from session if available
    // This prevents showing loader when switching tabs
    const sessionData = getProfileFromSession(userId);
    if (sessionData) {
      console.log("📦 Loading profile data from sessionStorage for user:", userId);
      // Ensure avatar_url is included from session data or fallback to user metadata
      const sessionDataWithAvatar = {
        ...sessionData,
        avatar_url: sessionData.avatar_url || 
                   (user as any)?.user_metadata?.avatar_url || 
                   (user as any)?.user_metadata?.picture || 
                   "",
      };
      setUserData(sessionDataWithAvatar);
      setFormData(sessionDataWithAvatar);
      setHasLoadedProfile(true);
      hasFetchedRef.current = userId;
      setIsLoading(false);
      hasInitialLoadRef.current = true; // Mark initial load as complete
      return; // Exit early - data loaded from sessionStorage
    }
    
    // STRICT CHECK: If we've already fetched for this exact user ID, do nothing
    // This check happens BEFORE any async work to prevent re-fetches on tab switch
    if (hasFetchedRef.current === userId || hasLoadedProfile) {
      // Already fetched for this user - absolutely no re-fetch (even on tab switch)
      setIsLoading(false);
      hasInitialLoadRef.current = true; // Ensure initial load flag is set
      return;
    }

    // NO SESSION DATA - Fetch from database
    // Only show loader if this is the initial load
    let isMounted = true;
    if (!hasInitialLoadRef.current) {
      setIsLoading(true);
    }

    const fetchProfileData = async () => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("❌ Error fetching profile:", error);
          if (isMounted) {
            toast.error("Failed to load profile data");
            setIsLoading(false);
            setHasLoadedProfile(true); // Mark as loaded even on error to prevent retry loops
            hasInitialLoadRef.current = true; // Mark initial load as complete even on error
          }
          return;
        }

        if (profile && isMounted) {
          console.log("Profile data from database:", profile);

          // Parse full_name into first and last name
          const nameParts = profile.full_name?.split(" ") || ["", ""];
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          // Check if phone is null/empty and get from user metadata
          let phone = profile.phone || "";
          if (!phone && (user as any)?.user_metadata?.phone) {
            phone = (user as any).user_metadata.phone;
            console.log("Phone from user metadata:", phone);

            // Update the profile with phone from metadata
            try {
              const { error: updateError } = await supabase
                .from("profiles")
                .update({
                  phone: phone,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", userId);

              if (updateError) {
                console.error(
                  "Error updating phone from metadata:",
                  updateError
                );
              } else {
                console.log("Phone updated from metadata to profile");
              }
            } catch (updateError) {
              console.error("Error updating phone from metadata:", updateError);
            }
          }

          // Get avatar/image from profile or user metadata
          const avatarUrl = profile.avatar_url || 
                           profile.image_url || 
                           (user as any)?.user_metadata?.avatar_url || 
                           (user as any)?.user_metadata?.picture || 
                           "";

          const profileData = {
            firstName,
            lastName,
            email: profile.email || user.email || "",
            phone: phone,
            address: profile.address || "",
            city: profile.city || "",
            state: profile.state || "",
            zipCode: profile.zip_code || "",
            country: profile.country || "Nigeria",
            avatar_url: avatarUrl,
          };

          console.log("Processed profile data:", profileData);

          if (isMounted) {
            setUserData(profileData);
            setFormData(profileData);
            setHasLoadedProfile(true);
            hasFetchedRef.current = userId;
            hasInitialLoadRef.current = true; // Mark initial load as complete
            
            // SAVE TO SESSIONSTORAGE - Persist across tab switches
            saveProfileToSession(userId, profileData);
            
            console.log("✅ Profile data loaded and saved to sessionStorage for user:", userId);
          }
        }
      } catch (error) {
        console.error("❌ Exception during profile fetch:", error);
        if (isMounted) {
          toast.error("Failed to load profile data");
          setHasLoadedProfile(true);
          setIsLoading(false);
          hasInitialLoadRef.current = true; // Mark initial load as complete even on error
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          hasInitialLoadRef.current = true; // Ensure flag is set
        }
      }
    };

    console.log("🔄 Fetching profile data from database for user:", userId);
    fetchProfileData();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
    // STRICT DEPENDENCY: Only depend on user ID (string primitive) to prevent unnecessary re-runs
    // SessionStorage persists data across tab switches - only refetch when user ID changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only re-run when user ID actually changes (not on tab switch)

  const handleSave = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    try {
      setIsSaving(true);

      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone || "", // Save phone as empty string instead of null
          address: formData.address || "",
          city: formData.city || "",
          state: formData.state || "",
          zip_code: formData.zipCode || "",
          country: formData.country || "Nigeria",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        setIsSaving(false);
        return;
      }

      // Also update user metadata with phone if it's not already there
      if (
        formData.phone &&
        (!(user as any)?.user_metadata?.phone ||
          (user as any).user_metadata.phone !== formData.phone)
      ) {
        try {
          const { error: metadataError } = await supabase.auth.updateUser({
            data: {
              phone: formData.phone,
            },
          });

          if (metadataError) {
            console.error("Error updating user metadata:", metadataError);
          } else {
            console.log("Phone updated in user metadata");
          }
        } catch (metadataError) {
          console.error("Error updating user metadata:", metadataError);
        }
      }

      setUserData(formData);
      
      // Update sessionStorage with new profile data
      if (user?.id) {
        saveProfileToSession(user.id, formData);
      }
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVendorInputChange = (field: string, value: string | object) => {
    setVendorFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveVendor = async () => {
    if (!vendor) {
      notify("Vendor information not loaded. Please refresh the page.", "error");
      return;
    }

    setIsSavingVendor(true);
    try {
      const response = await fetch("/api/vendor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...vendorFormData,
          _vendorId: vendor.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}${data.suggestion ? ` ${data.suggestion}` : ""}`
          : data.error || "Failed to update vendor";
        notify(errorMessage, "error");
        return;
      }

      notify("Vendor profile updated successfully!", "success");
      
      // Refresh page after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error saving vendor:", error);
      notify(error.message || "Failed to save changes. Please try again.", "error");
    } finally {
      setIsSavingVendor(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    ...(vendor ? [{ id: "vendor", label: "Vendor", icon: Building2 }] : []),
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Show loading state ONLY on initial load, not when switching tabs
  if (isLoading && !hasInitialLoadRef.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your profile.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left transition-colors text-sm sm:text-base ${
                        activeTab === tab.id
                          ? "bg-primary-50 text-primary-700 border border-primary-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center sm:justify-start gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base w-full sm:w-auto"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-gray-900 break-words">{userData.firstName || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-gray-900 break-words">{userData.lastName || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm sm:text-base text-gray-900 break-words">{userData.email || "—"}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm sm:text-base text-gray-900 break-words">{userData.phone || "—"}</p>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm sm:text-base text-gray-900 break-words">{userData.address || "—"}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-gray-900 break-words">{userData.city || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-gray-900 break-words">{userData.state || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-gray-900 break-words">{userData.zipCode || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-gray-900 break-words">{userData.country || "—"}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "vendor" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                {vendorLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-sm sm:text-base text-gray-600">Loading vendor information...</p>
                  </div>
                ) : !vendor ? (
                  <div className="text-center py-8 sm:py-12">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      No Vendor Account
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                      You don't have a vendor account yet. Register to start selling on Kanyiji.
                    </p>
                    <Link
                      href="/vendor/register"
                      className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Become a Vendor
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Vendor Information
                      </h2>
                      <button
                        onClick={handleSaveVendor}
                        disabled={isSavingVendor}
                        className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
                      >
                        {isSavingVendor ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isSavingVendor ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  <div className="space-y-6">
                    {/* Business Information */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        Business Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Name
                          </label>
                          <input
                            type="text"
                            value={vendorFormData.business_name || ""}
                            onChange={(e) => handleVendorInputChange("business_name", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Type
                          </label>
                          <select
                            value={vendorFormData.business_type || ""}
                            onChange={(e) => handleVendorInputChange("business_type", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="individual">Individual</option>
                            <option value="company">Company</option>
                            <option value="cooperative">Cooperative</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Email
                          </label>
                          <input
                            type="email"
                            value={vendorFormData.business_email || ""}
                            onChange={(e) => handleVendorInputChange("business_email", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={vendorFormData.phone || ""}
                            onChange={(e) => handleVendorInputChange("phone", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Registration Number
                          </label>
                          <input
                            type="text"
                            value={vendorFormData.business_registration_number || ""}
                            onChange={(e) => handleVendorInputChange("business_registration_number", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tax ID
                          </label>
                          <input
                            type="text"
                            value={vendorFormData.tax_id || ""}
                            onChange={(e) => handleVendorInputChange("tax_id", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Description
                          </label>
                          <textarea
                            value={vendorFormData.business_description || ""}
                            onChange={(e) => handleVendorInputChange("business_description", e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        Address Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            value={vendorFormData.address || ""}
                            onChange={(e) => handleVendorInputChange("address", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={vendorFormData.city || ""}
                            onChange={(e) => handleVendorInputChange("city", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={vendorFormData.state || ""}
                            onChange={(e) => handleVendorInputChange("state", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            value={vendorFormData.country || "Nigeria"}
                            onChange={(e) => handleVendorInputChange("country", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={vendorFormData.postal_code || ""}
                            onChange={(e) => handleVendorInputChange("postal_code", e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Website & Social Media */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        Website & Social Media
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website URL
                          </label>
                          <input
                            type="url"
                            value={vendorFormData.website_url || ""}
                            onChange={(e) => handleVendorInputChange("website_url", e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => (
                          <div key={platform}>
                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                              {platform}
                            </label>
                            <input
                              type="url"
                              value={vendorFormData.social_media?.[platform] || ""}
                              onChange={(e) => handleVendorInputChange("social_media", {
                                ...vendorFormData.social_media,
                                [platform]: e.target.value
                              })}
                              placeholder={`https://${platform}.com/yourpage`}
                              className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Information (Read-only) */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        Status Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>
                  </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Account Settings
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  {/* Security Section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                      Security
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
                              Password
                            </h4>
                            <p className="text-gray-600 text-xs sm:text-sm">
                              Change your account password
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (!isGoogleUser) {
                                setShowPasswordModal(true);
                              }
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${
                              isGoogleUser
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-primary-600 text-white hover:bg-primary-700"
                            }`}
                            disabled={isGoogleUser}
                            title={
                              isGoogleUser
                                ? "Password change not available for Google accounts"
                                : "Change your password"
                            }
                          >
                            {isGoogleUser
                              ? "Change Password (Google)"
                              : "Change Password"}
                          </button>
                        </div>
                      </div>

                      {/* Two-Factor Authentication - Only for Vendors */}
                      {vendor && (
                        <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
                                Two-Factor Authentication (2FA)
                              </h4>
                              <p className="text-gray-600 text-xs sm:text-sm">
                                Add an extra layer of security to your vendor account
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                notify("2FA setup coming soon. This feature will allow you to secure your vendor account with an authenticator app.", "info");
                              }}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                            >
                              Enable 2FA
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preferences Section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                      Preferences
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
                              Notifications
                            </h4>
                            <p className="text-gray-600 text-xs sm:text-sm">
                              Manage your email and push notifications
                            </p>
                          </div>
                          <button
                            onClick={() => setShowNotificationsModal(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                          >
                            Manage Notifications
                          </button>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
                              Privacy
                            </h4>
                            <p className="text-gray-600 text-xs sm:text-sm">
                              Control your privacy settings and data sharing
                            </p>
                          </div>
                          <button
                            onClick={() => setShowPrivacyModal(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                          >
                            Privacy Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                      Danger Zone
                    </h3>
                    <div className="p-3 sm:p-4 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm sm:text-base text-red-900 mb-1">
                            Delete Account
                          </h4>
                          <p className="text-red-600 text-xs sm:text-sm">
                            Permanently delete your account and all data. This
                            action cannot be undone.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modals */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        user={user}
      />

      <NotificationsSettings
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />

      <PrivacySettings
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
