import { User } from './types';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, 
  updateDoc, deleteDoc, increment, arrayUnion, 
  onSnapshot, serverTimestamp, getDocs, doc
} from 'firebase/firestore';

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBscaY5kkaXkea9ZFoMeqYNvmCnVEVeTfs",
  authDomain: "tea-and-o-amazing-race.firebaseapp.com",
  projectId: "tea-and-o-amazing-race",
  storageBucket: "tea-and-o-amazing-race.firebasestorage.app",
  messagingSenderId: "138999611724",
  appId: "1:138999611724:web:2698b10f0cff7b3ea74fe9",
  measurementId: "G-B0KZL6PPC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const RACERS_COLLECTION = 'racers';
const LOCAL_STORAGE_KEY = 'tea_o_race_data';

// State to track if we are using fallback mode due to errors
let usingFallback = false;
// Internal listener queue
const listeners: ((users: User[], isOnline: boolean) => void)[] = [];
let unsubscribeSnapshot: (() => void) | null = null;

// --- LOCAL STORAGE HELPERS ---
const getLocalUsers = (): User[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveLocalUsers = (users: User[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
  // Notify listeners with offline status
  listeners.forEach(cb => cb(users, false));
};

// Internal function to start the snapshot listener
const startSnapshotListener = () => {
  if (unsubscribeSnapshot) unsubscribeSnapshot(); // Clear existing

  const q = collection(db, RACERS_COLLECTION);
  
  unsubscribeSnapshot = onSnapshot(q, 
    (snapshot) => {
      // Success! Connection is live.
      usingFallback = false;
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      
      // Update local storage backup
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
      
      // Notify listeners
      listeners.forEach(cb => cb(users, true));
    }, 
    (error) => {
      console.warn("Firebase Error (Switching to Offline Mode):", error.message);
      usingFallback = true;
      
      // If we failed, serve local data immediately
      const localData = getLocalUsers();
      listeners.forEach(cb => cb(localData, false));
    }
  );
};

export const api = {
  // Subscribe to real-time updates
  subscribeToUsers(callback: (users: User[], isOnline: boolean) => void): () => void {
    listeners.push(callback);

    // If this is the first listener, start the connection
    if (listeners.length === 1) {
      startSnapshotListener();
    } else {
       // If already connected/fallback, give current state immediately
       // We can't easily know current data without tracking it, 
       // so simple fetch:
       if (usingFallback) {
         callback(getLocalUsers(), false);
       } else {
         // Let the next snapshot update handle it, or we could fetch? 
         // onSnapshot usually fires immediately with cached data if available.
       }
    }

    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
      // If no listeners left, we could unsubscribe, but keeping it open is fine for this app
    };
  },

  // Manual Retry
  retryConnection() {
    usingFallback = false;
    startSnapshotListener();
  },

  // Create a new user
  async addUser(name: string, teamName: string, iconId: string): Promise<User | null> {
    const newUserBase = {
      name,
      teamName: teamName || "",
      iconId,
      steps: 0,
      stepHistory: [],
    };

    if (!usingFallback) {
      try {
        const docRef = await addDoc(collection(db, RACERS_COLLECTION), {
          ...newUserBase,
          createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...newUserBase } as User;
      } catch (e) {
        console.warn("Firebase Write Failed, switching to fallback");
        usingFallback = true;
      }
    }

    // Fallback Implementation
    const localUsers = getLocalUsers();
    const newUser = { 
      ...newUserBase, 
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    localUsers.push(newUser);
    saveLocalUsers(localUsers);
    return newUser;
  },

  // Add steps to an existing user
  async addSteps(userId: string, steps: number): Promise<User | null> {
    if (!usingFallback) {
      try {
        const userRef = doc(db, RACERS_COLLECTION, userId);
        
        await updateDoc(userRef, {
          steps: increment(steps),
          stepHistory: arrayUnion({
            amount: steps,
            date: new Date().toISOString()
          }),
          lastUpdated: serverTimestamp()
        });
        
        return { id: userId } as User; 
      } catch (e) {
        console.warn("Firebase Write Failed, switching to fallback");
        usingFallback = true;
      }
    }

    // Fallback Implementation
    const localUsers = getLocalUsers();
    const user = localUsers.find(u => u.id === userId);
    if (user) {
      user.steps += steps;
      if (!user.stepHistory) user.stepHistory = [];
      user.stepHistory.push({
        amount: steps,
        date: new Date().toISOString()
      });
      saveLocalUsers(localUsers);
      return user;
    }
    return null;
  },

  // Delete a user
  async deleteUser(userId: string): Promise<boolean> {
    if (!usingFallback) {
      try {
        await deleteDoc(doc(db, RACERS_COLLECTION, userId));
        return true;
      } catch (e) {
        usingFallback = true;
      }
    }

    // Fallback Implementation
    const localUsers = getLocalUsers();
    const filtered = localUsers.filter(u => u.id !== userId);
    saveLocalUsers(filtered);
    return true;
  }
};