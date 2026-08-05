import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA24avQm-UkXlUO77-vHnA-FtzXUB8YLCw',
  authDomain: 'win-toon-786.firebaseapp.com',
  projectId: 'win-toon-786',
  storageBucket: 'win-toon-786.firebasestorage.app',
  messagingSenderId: '154826974541',
  appId: '1:154826974541:web:e9e17650b478abfaa08304',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
