# Kanyiji Bugs & Issues List

This document tracks known bugs and issues that need to be addressed in the Kanyiji marketplace platform.

---

## 1. Continuous Spinning on Window Exit ✅ FIXED

**Issue:** The application shows a continuous loading spinner when the web window is exited.

**Status:** Fixed  
**Priority:** Medium

**Fix Applied:** Added event listeners in `AuthContext.tsx` to reset loading state when:

- Window is about to close (`beforeunload` event)
- Page becomes hidden (`visibilitychange` event)
- Window loses focus (`blur` event)

This ensures the loading spinner doesn't get stuck when the user exits the window or switches tabs.

---

## 2. Products Not Showing in Correct Categories

**Issue:** Products are not displaying in their appropriate categories. For example, the Fashion and Textile category shows zero products when there are 2 products from D'moore already assigned to that category.

**Status:** Open  
**Priority:** High

---

## 3. Size Chart for Clothing Vendors

**Issue:** Need to create a size chart feature for clothing vendors to display sizing information.

**Status:** Open  
**Priority:** Medium

---

## 4. Customer Purchase/Customization Notes

**Issue:** Need to add a space/field for customers to leave purchase or customization notes during checkout.

**Status:** Open  
**Priority:** Medium

---

## 5. Vendor Payout Details

**Issue:** Vendors cannot fill in their payout details yet. Need to test account summary and payout functionality.

**Status:** Open  
**Priority:** High

---

## 6. Incorrect Phone Number on Help Page

**Issue:** The phone number displayed on the help page is incorrect.

**Status:** Open  
**Priority:** Low

---

## 7. Vendor Profile Not Visible on Mobile

**Issue:** When signing in on a mobile device, the vendor profile is not visible/accessible.

**Status:** Open  
**Priority:** High

---

## 8. Vendor Sign Up Error on Mobile

**Issue:** The vendor sign up process shows an error message when attempting to sign up using a mobile device.

**Status:** Open  
**Priority:** High

---

## 9. Kanyiji Store Link for Vendors

**Issue:** Need to create a feature that generates a unique Kanyiji store link for each vendor.

**Status:** Open  
**Priority:** Medium

---

## 10. Extra Weight Validation

**Issue:** Need to ensure that the extra weight added is not less than 1 kg, regardless of the size that the vendor inputs.

**Status:** Open  
**Priority:** Medium

---

## 11. Original Size vs Sales Price Problem

**Issue:** There is an issue with how original size is handled versus sales price.

**Status:** Open  
**Priority:** Medium

---

## 12. Missing Vendor Profile Information

**Issue:** Information entered by vendors during signup doesn't appear on their profile. For example, D'moore's profile under vendor settings is missing email and phone number.

**Status:** Open  
**Priority:** High

---

## Notes

- This list is maintained as bugs are discovered and reported.
- Priority levels: High, Medium, Low
- Status: Open, In Progress, Resolved, Closed

---

_Last Updated: $(date)_
