import React from 'react';
import { User } from '../types';
import { Award, ArrowDown } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
  const sortedUsers = [...users].sort((a, b) => (b.steps || 0) - (a.steps || 0));
  const podium = sortedUsers.slice(0, 5); // Top 5
  // For pit crew, we want the bottom 5, but sorted descending (worst is last) or ascending?
  // Usually "Needs Motivation" implies showing the ones with lowest steps.
  // Let's grab the last 5, then reverse them so the lowest is at the bottom of the list visually,
  // or show the lowest 5 sorted by lowest first? 
  // Standard leaderboard usually shows Top 5. "Bottom 5" usually shows the absolute lowest.
  // Let's filter out anyone with 0 steps if we want to be kind, but request says "Needs motivation".
  const pitCrew = sortedUsers.slice(-5).reverse(); 

  // Helper for rank badge color
  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-[#FBBC05] text-white'; // Gold
      case 1: return 'bg-[#9AA0A6] text-white'; // Silver
      case 2: return 'bg-[#E37400] text-white'; // Bronze
      default: return 'bg-blue-50 text-blue-600'; // Others
    }
  };

  const getDisplayName = (u: User) => u.teamName ? u.teamName : u.name;
  const getSubtext = (u: User) => u.teamName ? u.name : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Podium */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <div className="bg-yellow-100 p-2 rounded-full">
                <Award className="text-[#FBBC05]" size={20} />
            </div>
            <h2 className="text-lg font-normal text-gray-800">Top 5 Walkers</h2>
        </div>
        {users.length === 0 ? (
           <p className="text-gray-400 text-center italic py-4">Waiting for racers to join...</p>
        ) : (
          <ul className="space-y-4">
            {podium.map((user, index) => (
              <li key={user.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className={`
                      w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                      ${getRankColor(index)}
                  `}>
                      {index + 1}
                  </span>
                  <div>
                     <span className="text-gray-700 font-medium text-lg block leading-tight">{getDisplayName(user)}</span>
                     {getSubtext(user) && <span className="text-xs text-gray-400">{getSubtext(user)}</span>}
                  </div>
                </div>
                <span className="font-roboto text-gray-900 font-bold">{(user.steps || 0).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pit Crew */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <div className="bg-red-50 p-2 rounded-full">
                <ArrowDown className="text-[#EA4335]" size={20} />
            </div>
            <h2 className="text-lg font-normal text-gray-800">Needs Motivation (Bottom 5)</h2>
        </div>
         {users.length === 0 ? (
           <p className="text-gray-400 text-center italic py-4">No data yet.</p>
        ) : (
          <ul className="space-y-4">
            {pitCrew.map((user, index) => (
              <li key={user.id} className="flex items-center justify-between opacity-80">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold bg-gray-100 text-gray-500">
                      {users.length - index}
                  </span>
                  <div>
                     <span className="text-gray-600 font-medium text-lg block leading-tight">{getDisplayName(user)}</span>
                     {getSubtext(user) && <span className="text-xs text-gray-400">{getSubtext(user)}</span>}
                  </div>
                </div>
                <span className="font-roboto text-[#EA4335] font-medium">{(user.steps || 0).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;