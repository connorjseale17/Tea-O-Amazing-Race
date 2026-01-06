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

// Reverted to standard root collection 'racers' for reliability
const RACERS_COLLECTION = 'racers';
const LOCAL_STORAGE_KEY = 'tea_o_race_data';

// Internal listener queue
const listeners: ((users: User[], isOnline: boolean) => void)[] = [];
let unsubscribeSnapshot: (() => void) | null = null;
let isOfflineMode = false;

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
      isOfflineMode = false;
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
      isOfflineMode = true;
      
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
       // Send immediate cached response
       if (isOfflineMode) {
         callback(getLocalUsers(), false);
       } 
    }

    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  // Manual Retry
  retryConnection() {
    isOfflineMode = false;
    startSnapshotListener();
  },

  // Create a new user
  // WE ALWAYS TRY FIREBASE FIRST NOW, REGARDLESS OF PREVIOUS STATUS
  async addUser(name: string, teamName: string, iconId: string): Promise<User | null> {
    const newUserBase = {
      name,
      teamName: teamName || "",
      iconId,
      steps: 0,
      stepHistory: [],
    };

    try {
      const docRef = await addDoc(collection(db, RACERS_COLLECTION), {
        ...newUserBase,
        createdAt: serverTimestamp()
      });
      
      // If we get here, Firebase is working! Reset offline mode if it was set.
      if (isOfflineMode) {
        isOfflineMode = false;
        startSnapshotListener();
      }
      
      return { id: docRef.id, ...newUserBase } as User;
    } catch (e) {
      console.warn("Firebase Write Failed, switching to fallback", e);
      isOfflineMode = true;
      
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
    }
  },

  // Add steps to an existing user
  async addSteps(userId: string, steps: number): Promise<User | null> {
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
      
      // Heal connection if needed
      if (isOfflineMode) {
        isOfflineMode = false;
        startSnapshotListener();
      }

      return { id: userId } as User; 
    } catch (e) {
      console.warn("Firebase Write Failed, switching to fallback", e);
      isOfflineMode = true;
      
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
    }
  },

  // Delete a user
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, RACERS_COLLECTION, userId));
      
      if (isOfflineMode) {
        isOfflineMode = false;
        startSnapshotListener();
      }
      
      return true;
    } catch (e) {
      isOfflineMode = true;
      
      // Fallback Implementation
      const localUsers = getLocalUsers();
      const filtered = localUsers.filter(u => u.id !== userId);
      saveLocalUsers(filtered);
      return true;
    }
  }
};