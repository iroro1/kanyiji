// utils/validateSignupForm.ts
export function validateSignupForm(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}) {
  const errors: Record<string, string> = {};

  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!formData.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?\d{10,15}$/.test(formData.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!formData.address.trim()) {
    errors.address = "Address is required.";
  }

  if (!formData.city.trim()) {
    errors.city = "City is required.";
  }

  if (!formData.state.trim()) {
    errors.state = "State is required.";
  }

  // if (!formData.password.trim()) {
  //   errors.password = "Password is required.";
  // } else if (formData.password.length < 6) {
  //   errors.password = "Password must be at least 6 characters.";
  // }

  // if (!formData.confirmPassword.trim()) {
  //   errors.confirmPassword = "Please confirm your password.";
  // } else if (formData.confirmPassword !== formData.password) {
  //   errors.confirmPassword = "Passwords do not match.";
  // }

  return errors;
}
