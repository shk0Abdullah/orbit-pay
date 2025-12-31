// src/utils/toast.js
import Toast from 'react-native-toast-message';

interface toast{
    type : string,
    title : string,
    message : string
}

export const showToast = ({
  type = 'success',
  title,
  message,
} : toast) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 6000,
  });
};
