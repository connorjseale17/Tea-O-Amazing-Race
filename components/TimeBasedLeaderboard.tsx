import React, { useState } from 'react';
import { User } from '../types';
import { Calendar, Zap, TrendingUp, Clock } from 'lucide-react';

interface TimeBasedLeaderboardProps {
  users: User[];
}

type TimeFrame = 'weekly' | 'monthly';

const TimeBasedLeaderboard: React.FC<TimeBasedLeaderboardProps> = ({ users }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');

  const calculateScore = (user: User, days: number) => {
    if (!user.stepHistory || user.stepHistory.length === 0) return 0;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return user.stepHistory
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getLeaderboardData = () => {
    const days = timeFrame === 'weekly' ? 7 : 30;
    
    return users
      .map(user => ({
        ...user,
        periodScore: calculateScore(user, days)
      }))
      .sort((a, b) => b.periodScore - a.periodScore)
      .slice(0, 5) // Top 5
      .filter(u => u.periodScore > 0); // Only show if they have steps in this period
  };

  const leaders = getLeaderboardData();
  const getDisplayName = (u: User) => u.teamName ? u.teamName : u.name;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-16 -mt-16 opacity-50" />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 relative z-10 gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${timeFrame === 'weekly' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'} transition-colors duration-300`}>
             {timeFrame === 'weekly' ? <Zap size={24} /> : <Calendar size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-normal text-gray-800">Momentum Tracker</h2>
            <p className="text-gray-500 text-sm">Who is moving the most right now?</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="bg-gray-100 p-1.5 rounded-xl flex items-center">
          <button
            onClick={() => setTimeFrame('weekly')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              timeFrame === 'weekly' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeFrame('monthly')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              timeFrame === 'monthly' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
        {leaders.length === 0 ? (
           <div className="col-span-full py-12 text-center text-gray-400 flex flex-col items-center">
              <Clock size={48} className="mb-4 opacity-20" />
              <p>No activity recorded in this time period yet.</p>
              <p className="text-xs mt-1">Start logging steps to see momentum stats!</p>
           </div>
        ) : (
          leaders.map((user, index) => (
            <div 
              key={user.id}
              className={`
                flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 hover:shadow-md
                ${index === 0 ? 'bg-gradient-to-b from-white to-gray-50 border-gray-200 md:scale-105 z-10' : 'bg-white border-gray-100'}
              `}
            >
               {index === 0 && (
                 <div className="mb-2 bg-yellow-100 text-[#f59e0b] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                   <TrendingUp size={12} /> ON FIRE
                 </div>
               )}
               <div className="mb-2">
                 {/* Re-using logic to grab icon color based on ID from parent would be ideal, but simple fallback circle is fine for this view */}
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}
                 `}>
                   #{index + 1}
                 </div>
               </div>
               <h3 className="font-bold text-gray-800 text-center leading-tight mb-1 truncate w-full">{getDisplayName(user)}</h3>
               <p className={`text-xl font-roboto font-bold ${timeFrame === 'weekly' ? 'text-indigo-600' : 'text-purple-600'}`}>
                 {user.periodScore.toLocaleString()}
               </p>
               <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Steps</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TimeBasedLeaderboard;