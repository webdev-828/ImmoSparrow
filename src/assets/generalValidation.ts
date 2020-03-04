const validation = {
  en: {
    custom: {
      password: {
        required: 'Please enter password',
        min: 'Password must contain at least 1 lowercase, 1 uppercase, 1 numeric and 1 special characters, and have minimum 8 symbols',
        max: 'Password must contain at least 1 lowercase, 1 uppercase, 1 numeric and 1 special characters, and have maximum 50 symbols',
        regex: 'Password must contain at least 1 lowercase, 1 uppercase, 1 numeric and 1 special characters, and have minimum 8 symbols',
      },
      'password-confirm': {
        required: 'Please enter your password again',
        confirmed: 'Please repeat your new password',
      },
    },
  },
};

export default validation;
