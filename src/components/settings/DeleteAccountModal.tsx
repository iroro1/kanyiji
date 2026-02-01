"use client";

import { useState } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"warning" | "confirm">("warning");
  const router = useRouter();

  const expectedText = "DELETE MY ACCOUNT";
  const isConfirmationValid = confirmationText === expectedText;

  const handleDeleteAccount = async () => {
    if (!isConfirmationValid) {
      toast.error("Please type the confirmation text exactly as shown");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        toast.error("User not found");
        return;
      }
  
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete account");
      }
  
      toast.success("Account deleted successfully");
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting your account");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleClose = () => {
    if (!isLoading) {
      setConfirmationText("");
      setStep("warning");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Delete Account
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "warning" && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">
                      This action cannot be undone
                    </h3>
                    <p className="text-sm text-red-700">
                      Deleting your account will permanently remove all your data, 
                      including your profile, orders, and preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  What will be deleted:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your profile and personal information</li>
                  <li>• All your orders and order history</li>
                  <li>• Your wishlist and saved items</li>
                  <li>• Your notification preferences</li>
                  <li>• All account settings and data</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Before you delete:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Download any important data you want to keep</li>
                  <li>• Cancel any active subscriptions</li>
                  <li>• Consider deactivating instead of deleting</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Continue to Delete
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">
                      Final Confirmation
                    </h3>
                    <p className="text-sm text-red-700">
                      This is your last chance to cancel. Once you confirm, 
                      your account will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To confirm deletion, type: <strong>DELETE MY ACCOUNT</strong>
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type the confirmation text here"
                  disabled={isLoading}
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-sm text-red-600 mt-1">
                    Text must match exactly: "DELETE MY ACCOUNT"
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep("warning")}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!isConfirmationValid || isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    "Delete Account Forever"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
