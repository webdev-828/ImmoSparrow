const validation = {
  en: {
    custom: {
      'accept-AGBs': {
        required: 'Please accept AGBs.',
      },
      'company-name': {
        required: 'Please enter company name.',
      },
      street: {
        required: 'Please enter street name.',
      },
      'street-number': {
        required: 'Please enter street number.',
      },
      zip: {
        required: 'Please enter zip.',
      },
      city: {
        required: 'Please enter city.',
      },
      'first-name': {
        required: 'Please enter employee first name.',
        alpha: 'First name should consist of letters only.',
      },
      'last-name': {
        required: 'Please enter employee last name.',
        alpha: 'Last name should consist of letters only.',
      },
      'current-password': {
        required: 'Please enter your current password.',
      },
      password: {
        required: 'Please enter employee password.',
        min: 'Password must be minimum 8 symbols.',
        alpha_num: 'Password should consist of letters and numbers only.',
        regex: 'Password must contain at least 1 lowercase, 1 uppercase, 1 numeric and 1 special characters.',
      },
      'password-confirm': {
        required: 'Please enter employee password again.',
        confirmed: 'Please repeat employee password.',
      },
      email: {
        required: 'Please enter email.',
        email: 'Email should be valid.',
      },
    },
  },
};

export default validation;
