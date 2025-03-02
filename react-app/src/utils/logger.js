const isDevelopment = process.env.REACT_APP_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args) => {
    // エラーは本番環境でも記録
    console.error(...args);
  },
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};
