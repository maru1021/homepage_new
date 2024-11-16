const employeeValid = (employeeNo) => {
  const employeeNoPattern = /^[a-zA-Z0-9]{7}$/;
  return employeeNoPattern.test(employeeNo)
}

export default employeeValid;