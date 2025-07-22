
export const isAdminUser = (email: string): boolean => {
  return email === 'anand01ts@gmail.com';
};

export const isAdminCredentials = (email: string, password: string): boolean => {
  return email === 'anand01ts@gmail.com' && password === 'Anand.1105';
};
