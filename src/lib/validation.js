// Validation for the delivery form. Pure: values in, error messages out ({} means valid).

export const NOTES_MAX = 200;

export function validateDelivery(values) {
  const errors = {};

  const name = values.name.trim();
  if (name === "") errors.name = "Enter the name for the delivery.";
  else if (name.length < 2 || !/\p{L}/u.test(name)) errors.name = "Use a real name, at least 2 characters with a letter.";
  else if (name.length > 60) errors.name = "Keep the name under 60 characters.";

  const phone = values.phone.trim();
  const digits = phone.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  if (phone === "") errors.phone = "Enter a phone number so the cook can reach you.";
  else if (!/^\d{7,15}$/.test(digits)) errors.phone = "Use 7 to 15 digits. Spaces, dashes and a leading + are fine.";

  const address = values.address.trim();
  if (address === "") errors.address = "Enter your delivery address.";
  else if (address.length < 6) errors.address = "Add the street and number, at least 6 characters.";
  else if (address.length > 120) errors.address = "Keep the address under 120 characters.";

  if (values.notes.length > NOTES_MAX) errors.notes = `Keep notes under ${NOTES_MAX} characters.`;

  return errors;
}
