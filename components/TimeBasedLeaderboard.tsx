import React, { useState } from 'react';
import { User } from '../types';
import { TOTAL_WEEKS } from '../constants';
import { Zap, TrendingUp, Clock, Calendar } from 'lucide-react';

interface TimeBasedLeaderboardProps {
  users: User[];
}

// viewMode: 'overall' or string representing the week number '1', '2'...
type ViewMode = 'overall' | string;

const TimeBasedLeaderboard: React.FC<TimeBasedLeaderboardProps> = ({ users }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overall');
  const weeksArray = Array.from({ length: TOTAL_WEEKS }, (_, i) => (i + 1).toString());

  const calculateScore = (user: User) => {
    if (viewMode === 'overall') {
      return user.steps || 0;
    }
    // Access the specific week from the dictionary
    return user.weeklySteps ? (user.weeklySteps[viewMode] || 0) : 0;
  };

  const getLeaderboardData = () => {
    return users
      .map(user => ({
        ...user,
        currentScore: calculateScore(user)
      }))
      .sort((a, b) => b.currentScore - a.currentScore)
      .slice(0, 5) // Top 5
      .filter(u => u.currentScore > 0); // Only show if they have steps
  };

  const leaders = getLeaderboardData();
  const getDisplayName = (u: User) => u.teamName ? u.teamName : u.name;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-16 -mt-16 opacity-50" />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 relative z-10 gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${viewMode === 'overall' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'} transition-colors duration-300`}>
             {viewMode === 'overall' ? <Zap size={24} /> : <Calendar size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-normal text-gray-800">Momentum Tracker</h2>
            <p className="text-gray-500 text-sm">
              {viewMode === 'overall' ? 'All-time race leaders' : `Top performers for Week ${viewMode}`}
            </p>
          </div>
        </div>

        {/* Week Selector Dropdown */}
        <div className="bg-gray-100 p-1.5 rounded-xl flex items-center relative">
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="appearance-none bg-white text-gray-800 font-bold py-2 pl-4 pr-10 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm border-0"
          >
            <option value="overall">🏆 Overall Leaders</option>
            {weeksArray.map(week => (
              <option key={week} value={week}>📅 Week {week}</option>
            ))}
          </select>
          {/* Custom Arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-600">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
        {leaders.length === 0 ? (
           <div className="col-span-full py-12 text-center text-gray-400 flex flex-col items-center">
              <Clock size={48} className="mb-4 opacity-20" />
              <p>No activity recorded for this period.</p>
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
                   <TrendingUp size={12} /> LEADER
                 </div>
               )}
               <div className="mb-2">
                 {/* Rank Badge */}
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'}
                 `}>
                   #{index + 1}
                 </div>
               </div>
               <h3 className="font-bold text-gray-800 text-center leading-tight mb-1 truncate w-full">{getDisplayName(user)}</h3>
               <p className={`text-xl font-roboto font-bold ${viewMode === 'overall' ? 'text-indigo-600' : 'text-purple-600'}`}>
                 {user.currentScore.toLocaleString()}
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