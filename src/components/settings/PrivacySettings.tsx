"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Eye,
  EyeOff,
  User,
  Globe,
  Lock,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface PrivacySettings {
  profileVisibility: "public" | "private";
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowMessages: boolean;
  dataSharing: boolean;
  analyticsTracking: boolean;
}

interface PrivacySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacySettings({
  isOpen,
  onClose,
}: PrivacySettingsProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "private",
    showEmail: false,
    showPhone: false,
    showLocation: false,
    allowMessages: true,
    dataSharing: false,
    analyticsTracking: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPrivacySettings();
    }
  }, [isOpen]);

  const loadPrivacySettings = async () => {
    try {
      // In a real app, you'd fetch from a user_preferences table
      const savedSettings = localStorage.getItem("privacySettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading privacy settings:", error);
    }
  };

  const savePrivacySettings = async (newSettings: PrivacySettings) => {
    try {
      localStorage.setItem("privacySettings", JSON.stringify(newSettings));

      // Also save to user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          privacy_settings: newSettings,
        },
      });

      if (error) {
        console.error("Error saving to user metadata:", error);
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
    }
  };

  const handleToggle = async (
    key: keyof Omit<PrivacySettings, "profileVisibility">
  ) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(newSettings);
    await savePrivacySettings(newSettings);
    toast.success("Privacy settings updated");
  };

  const handleVisibilityChange = async (visibility: "public" | "private") => {
    const newSettings = {
      ...settings,
      profileVisibility: visibility,
    };

    setSettings(newSettings);
    await savePrivacySettings(newSettings);
    toast.success("Profile visibility updated");
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const privacyOptions = [
    {
      key: "showEmail" as keyof Omit<PrivacySettings, "profileVisibility">,
      title: "Show Email Address",
      description: "Allow others to see your email address",
      icon: User,
    },
    {
      key: "showPhone" as keyof Omit<PrivacySettings, "profileVisibility">,
      title: "Show Phone Number",
      description: "Allow others to see your phone number",
      icon: User,
    },
    {
      key: "showLocation" as keyof Omit<PrivacySettings, "profileVisibility">,
      title: "Show Location",
      description: "Allow others to see your city and state",
      icon: Globe,
    },
    {
      key: "allowMessages" as keyof Omit<PrivacySettings, "profileVisibility">,
      title: "Allow Messages",
      description: "Let other users send you messages",
      icon: User,
    },
    {
      key: "dataSharing" as keyof Omit<PrivacySettings, "profileVisibility">,
      title: "Data Sharing",
      description: "Share anonymized data to improve our services",
      icon: Shield,
    },
    {
      key: "analyticsTracking" as keyof Omit<
        PrivacySettings,
        "profileVisibility"
      >,
      title: "Analytics Tracking",
      description: "Help us improve by sharing usage analytics",
      icon: Shield,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Privacy Settings
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Visibility */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Profile Visibility
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleVisibilityChange("public")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  settings.profileVisibility === "public"
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Public</h4>
                    <p className="text-sm text-gray-600">
                      Your profile is visible to everyone
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleVisibilityChange("private")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  settings.profileVisibility === "private"
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Private</h4>
                    <p className="text-sm text-gray-600">
                      Only you can see your profile details
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Privacy Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Privacy Controls
            </h3>
            {privacyOptions.map((option) => {
              const Icon = option.icon;
              const isEnabled = settings[option.key];

              return (
                <div
                  key={option.key}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {option.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(option.key)}
                    className="flex items-center"
                    disabled={isLoading}
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-8 h-8 text-primary-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Privacy Notice</h3>
            <p className="text-sm text-yellow-700">
              We respect your privacy and never sell your personal data. Some
              information may be required for account security and service
              functionality.
            </p>
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
