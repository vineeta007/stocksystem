import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDYN2twq-2z-l-5lXDfsX_LHsZgWqqkYW8',
  authDomain: 'stocksystem-b88c7.firebaseapp.com',
  projectId: 'stocksystem-b88c7',
  storageBucket: 'stocksystem-b88c7.firebasestorage.app',
  messagingSenderId: '860299497832',
  appId: '1:860299497832:web:b355f006a54fedb03586dd',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);