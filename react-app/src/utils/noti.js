import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const successNoti = (message) => {
  toast.success(message, {
    style: { backgroundColor: '#81d4fa', color: '#000000' }
  });
}

const errorNoti = (message) => {
  toast.error(message, {
      style: { backgroundColor: '#ff8a80', color: '#000000' }
  });
}

export { successNoti, errorNoti };