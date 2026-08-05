import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA24avQm-UkXlUO77-vHnA-FtzXUB8YLCw',
  authDomain: 'win-toon-786.firebaseapp.com',
  projectId: 'win-toon-786',
  storageBucket: 'win-toon-786.firebasestorage.app',
  messagingSenderId: '154826974541',
  appId: '1:154826974541:web:e9e17650b478abfaa08304',
  measurementId: 'G-XY7KVPZY8C',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

// Analytics may not be available in all environments (e.g., WebView/private mode).
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(firebaseApp);
  }
}).catch(() => {});
