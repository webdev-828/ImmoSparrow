const validation = {
  en: {
    custom: {
      'first-name': {
        required: 'Please enter your First Name.',
        alpha: 'First Name should consist of letters only.',
      },
      'last-name': {
        required: 'Please enter your Last Name.',
        alpha: 'Last Name should consist of letters only.',
      },
      'current-password': {
        required: 'Please enter your current password',
      },
      email: {
        required: 'Please enter your email',
        email: 'Email should be valid',
      },
    },
  },
};

export default validation;
