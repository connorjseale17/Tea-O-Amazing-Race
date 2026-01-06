import React from 'react';
import { STEPS_PER_MILE, TOTAL_GOAL_STEPS, TOTAL_GOAL_MILES } from '../constants';
import { Users } from 'lucide-react';

interface DashboardStatsProps {
  totalSteps: number;
  activeUserCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ totalSteps, activeUserCount }) => {
  const totalMiles = totalSteps / STEPS_PER_MILE;
  const progressPercent = Math.min((totalSteps / TOTAL_GOAL_STEPS) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Steps */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Team Steps</h3>
          <p className="text-4xl font-normal text-gray-800 mt-2">{totalSteps.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
             <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
               <Users size={12} />
               {activeUserCount} Racers
             </div>
             <span>contributed</span>
          </div>
        </div>
      </div>

      {/* Miles Covered */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Distance Covered</h3>
        <p className="text-4xl font-normal text-gray-800 mt-2">{totalMiles.toFixed(1)} <span className="text-xl text-gray-400">mi</span></p>
        <div className="mt-2 flex items-center text-sm text-gray-400">
           <span className="text-red-500 font-medium mr-1">Target:</span> {TOTAL_GOAL_MILES.toLocaleString()} mi
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
        <div className="flex justify-between items-end mb-3">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Race Progress</h3>
            <span className="text-3xl font-normal text-green-600">{progressPercent.toFixed(2)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-[#34A853] h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;