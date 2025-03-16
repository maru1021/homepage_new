import { successNoti, errorNoti } from './noti';


const handleAPI = async (url, method, onSuccess = () => {}, sendData = null, errorFieldMap = {}) => {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    };

    if (sendData !== null) {
        options.body = JSON.stringify(sendData);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok && data.success) {
        successNoti(data.message);
        if (typeof onSuccess === 'function') {
            onSuccess();
        }
    } else {
        if (data.field && errorFieldMap[data.field]) {
            errorFieldMap[data.field](data.message);
        } else {
            errorNoti(data.message);
        }
    }
  };

  export default handleAPI;
