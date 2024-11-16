const passwordValid = (password) => {
  const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+={}[\]:;"'<>,.?/\\|-]{8,20}$/;
  return passwordPattern.test(password);
};

export default passwordValid;
