export const REGEX_PATTERNS = {
  PHONE: {
    INTERNATIONAL: /^(\+?\d{1,3}[- ]?)?\d{10}$/, // Indian mobile number OR international pattern
  },

  EMAIL: {
    STANDARD:
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
  },
};
