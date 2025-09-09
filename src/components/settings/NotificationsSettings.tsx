"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  priceAlerts: boolean;
}

interface NotificationsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsSettings({
  isOpen,
  onClose,
}: NotificationsSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
    priceAlerts: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotificationSettings();
    }
  }, [isOpen]);

  const loadNotificationSettings = async () => {
    try {
      // In a real app, you'd fetch from a user_preferences table
      // For now, we'll use localStorage as a fallback
      const savedSettings = localStorage.getItem("notificationSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const saveNotificationSettings = async (
    newSettings: NotificationSettings
  ) => {
    try {
      // In a real app, you'd save to a user_preferences table
      localStorage.setItem("notificationSettings", JSON.stringify(newSettings));

      // Also save to user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          notification_settings: newSettings,
        },
      });

      if (error) {
        console.error("Error saving to user metadata:", error);
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const handleToggle = async (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
    toast.success("Notification settings updated");
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const notificationOptions = [
    {
      key: "emailNotifications" as keyof NotificationSettings,
      title: "Email Notifications",
      description: "Receive notifications via email",
      icon: Mail,
    },
    {
      key: "pushNotifications" as keyof NotificationSettings,
      title: "Push Notifications",
      description: "Receive push notifications on your device",
      icon: Smartphone,
    },
    {
      key: "orderUpdates" as keyof NotificationSettings,
      title: "Order Updates",
      description: "Get notified about order status changes",
      icon: Bell,
    },
    {
      key: "marketingEmails" as keyof NotificationSettings,
      title: "Marketing Emails",
      description: "Receive promotional offers and updates",
      icon: Mail,
    },
    {
      key: "securityAlerts" as keyof NotificationSettings,
      title: "Security Alerts",
      description: "Important security notifications",
      icon: Bell,
    },
    {
      key: "priceAlerts" as keyof NotificationSettings,
      title: "Price Alerts",
      description: "Get notified when prices drop on your wishlist",
      icon: Bell,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Bell className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Notification Settings
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {notificationOptions.map((option) => {
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
                      <h3 className="font-medium text-gray-900">
                        {option.title}
                      </h3>
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

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              Notification Preferences
            </h3>
            <p className="text-sm text-blue-700">
              You can change these settings at any time. Some notifications are
              essential for account security and cannot be disabled.
            </p>
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
