const validateFields = (validationRules) => {
  let isValid = true;

  validationRules.forEach(({ value, errorField, errorMessage, type, ex=null }) => {
    if (type === "required") {
      if (!value) {
        errorField(errorMessage || "必須項目です。");
        isValid = false;
      } else {
        errorField("");
      }
    } else if (type === "employeeNo") {
      if (value === "") {
        errorField("社員番号を入力してください。");
        isValid = false;
      } else if (!/^[a-zA-Z0-9]{7}$/.test(value)) {
        errorField("7桁の英数字で入力してください。");
        isValid = false;
      } else {
        errorField("");
      }
    } else if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        errorField("メールアドレスを入力してください。");
        isValid = false;
      } else if (!emailRegex.test(value)) {
        errorField("正しいメールアドレスを入力してください。");
        isValid = false;
      } else {
        errorField("");
      }
    } else if (type === "phone") {
      const phoneRegex = /^(\d{4}-\d{2}-\d{4}|0[789]0-\d{4}-\d{4}|\+81-\d{1,4}-\d{1,4}-\d{4}|\d{10,11})$/;
      if (!value) {
        errorField("電話番号を入力してください。");
        isValid = false;
      } else if (!phoneRegex.test(value)) {
        errorField("正しい電話番号を入力してください。（例: 0120-12-3456, 080-1234-5678, 08012345678）");
        isValid = false;
      } else {
        errorField("")
      }
    } else if (type === "int") {
      if (!/^[0-9]+$/.test(value)) {
        errorField("整数を入力してください。");
        isValid = false;
      } else if (ex) {
        if (value < ex.min || value > ex.max) {
          errorField(errorMessage);
          isValid = false;
        } else {
          errorField("")
        }
      } else {
        errorField("")
      }
    } else if (type === "list") {
      const errors = {};
      value.forEach((form, index) => {
        if (!form.department) {
          errors[index] = errorMessage;
          isValid = false;
        } else {
          errors[index] =""
        }
      });
      errorField(errors);
    } else {
      errorField("")
    }
  });

  return isValid;
};

export default validateFields;
