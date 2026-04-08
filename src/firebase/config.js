import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAV_IAXBSf7MAUkrSNjOhA_-ptSkIZDQk0",
  authDomain: "fiapapp-d6e0f.firebaseapp.com",
  projectId: "fiapapp-d6e0f",
  databaseURL: "https://fiapapp-d6e0f-default-rtdb.firebaseio.com/",
  storageBucket: "fiapapp-d6e0f.firebasestorage.app",
  messagingSenderId: "134183412414",
  appId: "1:134183412414:web:2cdf414f1be5f8e09bb4ef"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
