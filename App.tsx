import React, { useState, useEffect } from 'react';
import { User, Waypoint } from './types';
import { ROUTE_WAYPOINTS, TOTAL_GOAL_STEPS, MAX_USERS } from './constants';
import RaceMap from './components/RaceMap';
import DashboardStats from './components/DashboardStats';
import Leaderboard from './components/Leaderboard';
import TimeBasedLeaderboard from './components/TimeBasedLeaderboard';
import AddStepsForm from './components/AddStepsForm';
import ReportGenerator from './components/ReportGenerator';
import { MapPin, Globe, Navigation, WifiOff } from 'lucide-react';
import { api } from './api';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [milestonesReached, setMilestonesReached] = useState<string[]>([]);
  const [activeNotification, setActiveNotification] = useState<Waypoint | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'global' | 'local'>('global');
  const [isOffline, setIsOffline] = useState(false);

  // Derived State
  const totalSteps = users.reduce((acc, user) => acc + user.steps, 0);
  const progressPercentage = Math.min(totalSteps / TOTAL_GOAL_STEPS, 1);

  // --- API INTEGRATION ---

  // Load Users & Start Polling
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await api.getUsers();
      if (data.length === 0 && users.length === 0) {
        // If we get empty list repeatedly, it might mean server is down or just empty DB.
        // We'll trust the API wrapper's error handling for "offline" detection if strictly needed,
        // but for now, we just set state.
      }
      setUsers(data);
    };

    fetchUsers(); // Initial fetch
    
    // Poll every 3 seconds for live updates
    const intervalId = setInterval(fetchUsers, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // Milestone Logic (Client-side calculation based on fetched data)
  useEffect(() => {
    const segmentSize = 1 / (ROUTE_WAYPOINTS.length - 1); 
    
    ROUTE_WAYPOINTS.forEach((wp, index) => {
        const requiredProgress = index * segmentSize; 
        
        // Only trigger if we are past the point AND it hasn't been triggered locally this session
        // Note: For a real persistent milestone system, we'd store 'milestones' in the DB too.
        // For now, we keep milestones local to the session view to avoid spamming alerts on reload.
        if (progressPercentage >= requiredProgress && index > 0 && !milestonesReached.includes(wp.name)) {
             setMilestonesReached(prev => [...prev, wp.name]);
             setActiveNotification(wp);
        }
    });
  }, [progressPercentage, milestonesReached]);

  // Handlers
  const handleAddSteps = async (userId: string, steps: number) => {
    // Optimistic Update
    const previousUsers = [...users];
    
    // We update local state immediately for responsiveness, though stepHistory isn't fully updated until refresh
    // This is fine for optimistic UI on the main total.
    setUsers(users.map(u => u.id === userId ? { ...u, steps: u.steps + steps } : u));

    // API Call
    const updatedUser = await api.addSteps(userId, steps);
    
    if (!updatedUser) {
      // Revert if failed
      setUsers(previousUsers);
      setIsOffline(true);
      setTimeout(() => setIsOffline(false), 3000);
    }
  };

  const handleAddUser = async (name: string, teamName: string, iconId: string) => {
    if (users.length >= MAX_USERS) return;

    // API Call
    const newUser = await api.addUser(name, teamName, iconId);
    
    if (newUser) {
      setUsers(prev => [...prev, newUser]);
    } else {
      setIsOffline(true);
      setTimeout(() => setIsOffline(false), 3000);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this racer? This cannot be undone.")) return;

    // Optimistic Update
    const previousUsers = [...users];
    setUsers(users.filter(u => u.id !== userId));

    const success = await api.deleteUser(userId);
    if (!success) {
      setUsers(previousUsers); // Revert
      setIsOffline(true);
      setTimeout(() => setIsOffline(false), 3000);
    }
  };

  const closeNotification = () => setActiveNotification(null);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 p-4 md:p-8 pb-32 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Connection Error Toast */}
        {isOffline && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-bounce-in">
             <WifiOff size={20} />
             <span>Server unreachable. Check backend connection.</span>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-6 gap-4 bg-white p-6 rounded-3xl shadow-sm border-0">
          <div>
            <h1 className="text-3xl font-normal tracking-tight">
              <span className="text-[#4285F4] font-bold">Tea&O</span> <span className="text-[#EA4335]">Amazing</span> <span className="text-[#FBBC05]">Race</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Seattle to NYC • 4,195 Miles</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <span className="w-2 h-2 bg-[#34A853] rounded-full animate-pulse"></span>
            <span className="text-sm font-bold text-[#34A853]">LIVE DATABASE</span>
          </div>
        </header>

        {/* Milestone Modal */}
        {activeNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl relative animate-bounce-in border border-gray-100">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#FBBC05] text-white p-3 rounded-full shadow-md">
                <MapPin size={32} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-normal text-center mt-6 text-gray-800">Checkpoint Reached</h2>
              <h3 className="text-xl text-center text-[#4285F4] font-medium mt-1">{activeNotification.name}</h3>
              <p className="text-gray-600 text-center mt-4 text-lg leading-relaxed">
                {activeNotification.fact}
              </p>
              <button 
                onClick={closeNotification}
                className="w-full mt-8 bg-[#4285F4] hover:bg-blue-600 text-white font-medium py-3 rounded-full shadow-md transition-transform active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Stats Dashboard */}
        <DashboardStats totalSteps={totalSteps} />

        {/* Map */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                 <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Live Route Map</h3>
                    <span className="text-xs text-gray-400">Powered by Leaflet</span>
                 </div>
                 
                 {/* Map View Toggle */}
                 <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setMapViewMode('global')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mapViewMode === 'global' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Globe size={16} />
                        Route View
                    </button>
                    <button 
                        onClick={() => setMapViewMode('local')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mapViewMode === 'local' ? 'bg-white text-[#4285F4] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Navigation size={16} />
                        Local View
                    </button>
                 </div>
             </div>
             <RaceMap progressPercentage={progressPercentage} viewMode={mapViewMode} />
        </div>

        {/* Total Leaderboard */}
        <div>
           <Leaderboard users={users} />
        </div>

        {/* Weekly / Monthly Momentum Leaderboard - NEW SECTION */}
        <div>
          <TimeBasedLeaderboard users={users} />
        </div>
          
        {/* Roster / Add User Form */}
        <AddStepsForm users={users} onAddSteps={handleAddSteps} onAddUser={handleAddUser} onRemoveUser={handleRemoveUser} />

        {/* Footer Actions */}
        <ReportGenerator users={users} totalSteps={totalSteps} />

        <footer className="text-center text-gray-400 text-sm pt-12">
           <p>© 2024 Tea&O • Internal Step Challenge</p>
        </footer>
      </div>
    </div>
  );
};

export default App;