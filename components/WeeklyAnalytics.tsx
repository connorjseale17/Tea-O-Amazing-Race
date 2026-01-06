import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { TOTAL_WEEKS } from '../constants';
import { BarChart2, Eye, EyeOff } from 'lucide-react';

// Vibrant palette for distinct user lines
const CHART_COLORS = [
  '#4285F4', // Blue
  '#EA4335', // Red
  '#FBBC05', // Yellow
  '#34A853', // Green
  '#8E24AA', // Purple
  '#00ACC1', // Cyan
  '#F4511E', // Deep Orange
  '#3949AB', // Indigo
  '#D81B60', // Pink
  '#00897B', // Teal
  '#C0CA33', // Lime
  '#6D4C41', // Brown
  '#5E35B1', // Deep Purple
  '#039BE5', // Light Blue
  '#7CB342', // Light Green
  '#FFB300', // Amber
  '#FB8C00', // Orange
  '#43A047', // Green
  '#E53935', // Red
  '#1E88E5'  // Blue
];

interface WeeklyAnalyticsProps {
  users: User[];
}

const WeeklyAnalytics: React.FC<WeeklyAnalyticsProps> = ({ users }) => {
  // Sort users by total steps initially to select top 5
  const sortedUsers = useMemo(() => [...users].sort((a, b) => b.steps - a.steps), [users]);
  
  // Default to showing top 5 active users
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sortedUsers.slice(0, 5).forEach(u => initial.add(u.id));
    return initial;
  });

  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  const toggleUser = (id: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedUserIds(newSet);
  };

  const getDisplayName = (u: User) => u.teamName ? u.teamName : u.name;

  // --- CHART CALCULATIONS ---
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
  const CHART_HEIGHT = 200; // Reduced height
  const CHART_WIDTH = 800;
  const PADDING_X = 40;
  const PADDING_Y = 20;

  // Calculate Max Y for scaling
  const maxSteps = useMemo(() => {
    let max = 10000; // Minimum scale
    users.forEach(u => {
      if (!selectedUserIds.has(u.id)) return;
      if (u.weeklySteps) {
        Object.values(u.weeklySteps).forEach((val) => {
          const steps = val as number;
          if (steps > max) max = steps;
        });
      }
    });
    return Math.ceil(max / 5000) * 5000; // Round up to nearest 5k
  }, [users, selectedUserIds]);

  // Helpers for coordinates
  const getX = (weekIndex: number) => {
    const usableWidth = CHART_WIDTH - (PADDING_X * 2);
    return PADDING_X + (weekIndex * (usableWidth / (TOTAL_WEEKS - 1)));
  };

  const getY = (steps: number) => {
    const usableHeight = CHART_HEIGHT - (PADDING_Y * 2);
    return CHART_HEIGHT - PADDING_Y - ((steps / maxSteps) * usableHeight);
  };

  // Generate paths
  const userPaths = useMemo(() => {
    return sortedUsers.map((user, index) => {
      if (!selectedUserIds.has(user.id)) return null;

      // Filter out weeks with 0 steps (no data)
      const validPoints = weeks
        .map((week, idx) => {
          const steps = user.weeklySteps?.[week] || 0;
          if (steps <= 0) return null; // Skip 0 or negative values

          return {
            x: getX(idx),
            y: getY(steps),
            value: steps,
            week
          };
        })
        .filter((pt): pt is NonNullable<typeof pt> => pt !== null);

      if (validPoints.length === 0) return null;

      // Construct SVG Path command
      // Move to first valid point, Line to subsequent valid points
      // This automatically bridges gaps if a week in the middle is missing
      const d = validPoints.map((pt, i) => 
        `${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`
      ).join(' ');

      return {
        userId: user.id,
        color: CHART_COLORS[index % CHART_COLORS.length],
        d,
        points: validPoints
      };
    }).filter((p): p is NonNullable<typeof p> => p !== null);
  }, [sortedUsers, selectedUserIds, maxSteps]);

  // Y-Axis Grid Lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const value = Math.round(maxSteps * pct);
    const y = getY(value);
    return { value, y };
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-100 p-2 rounded-full text-orange-600">
           <BarChart2 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-normal text-gray-800">Weekly Performance Analytics</h2>
          <p className="text-gray-500 text-sm">Compare racer trends week over week</p>
        </div>
      </div>

      {/* CHART AREA */}
      <div className="relative w-full h-[250px] overflow-hidden">
        <svg 
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} 
          className="w-full h-full font-sans text-xs select-none"
          preserveAspectRatio="none"
        >
          {/* Grid Lines & Y-Labels */}
          {gridLines.map((line, i) => (
            <g key={i}>
              <line 
                x1={PADDING_X} 
                y1={line.y} 
                x2={CHART_WIDTH - PADDING_X} 
                y2={line.y} 
                stroke="#f3f4f6" 
                strokeWidth="1" 
              />
              <text 
                x={PADDING_X - 5} 
                y={line.y + 4} 
                textAnchor="end" 
                fill="#9ca3af"
                className="text-[10px]"
              >
                {line.value >= 1000 ? `${line.value / 1000}k` : line.value}
              </text>
            </g>
          ))}

          {/* X-Axis Labels */}
          {weeks.map((week, idx) => (
            <text 
              key={week}
              x={getX(idx)}
              y={CHART_HEIGHT - 5}
              textAnchor="middle"
              fill="#6b7280"
              className="font-medium"
            >
              W{week}
            </text>
          ))}

          {/* User Lines */}
          {userPaths.map((path) => (
            <path
              key={path.userId}
              d={path.d}
              fill="none"
              stroke={path.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
              style={{ opacity: hoveredWeek !== null ? 0.3 : 1 }} 
            />
          ))}

          {/* Data Points (Only visible for visible lines) */}
          {userPaths.map((path) => (
            <g key={`points-${path.userId}`}>
               {path.points.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredWeek === pt.week ? 6 : 3}
                    fill="white"
                    stroke={path.color}
                    strokeWidth="2"
                    className="transition-all duration-200"
                    style={{ opacity: hoveredWeek !== null && hoveredWeek !== pt.week ? 0.1 : 1 }}
                  />
               ))}
            </g>
          ))}

          {/* Interaction Overlay columns */}
          {weeks.map((week, idx) => (
            <rect
              key={`overlay-${week}`}
              x={getX(idx) - (CHART_WIDTH / TOTAL_WEEKS / 2)}
              y={0}
              width={CHART_WIDTH / TOTAL_WEEKS}
              height={CHART_HEIGHT}
              fill="transparent"
              className="cursor-crosshair hover:fill-gray-50/50"
              onMouseEnter={() => setHoveredWeek(week)}
              onMouseLeave={() => setHoveredWeek(null)}
            />
          ))}
        </svg>

        {/* Custom Tooltip Overlay */}
        {hoveredWeek !== null && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 p-4 rounded-xl shadow-lg z-10 min-w-[200px] animate-fade-in pointer-events-none">
             <h4 className="text-gray-500 text-xs font-bold uppercase mb-2">Week {hoveredWeek} Stats</h4>
             <div className="space-y-1">
                {sortedUsers
                  .filter(u => selectedUserIds.has(u.id))
                  .map((u, i) => {
                    const steps = u.weeklySteps?.[hoveredWeek] || 0;
                    if (steps === 0) return null; // Don't show in tooltip if no data for this week

                    const color = CHART_COLORS[sortedUsers.findIndex(su => su.id === u.id) % CHART_COLORS.length];
                    return (
                      <div key={u.id} className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-gray-700 font-medium truncate max-w-[100px]">{getDisplayName(u)}</span>
                         </div>
                         <span className="font-mono font-bold text-gray-900">{steps.toLocaleString()}</span>
                      </div>
                    );
                  })
                }
                {/* Fallback if no one has data for this week */}
                {sortedUsers.every(u => !selectedUserIds.has(u.id) || !u.weeklySteps?.[hoveredWeek]) && (
                    <div className="text-gray-400 italic text-xs">No data for this week</div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* USER SELECTOR */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Toggle Racers</h3>
        <div className="flex flex-wrap gap-2">
          {sortedUsers.map((u, i) => {
             const isSelected = selectedUserIds.has(u.id);
             const color = CHART_COLORS[i % CHART_COLORS.length];
             
             return (
               <button
                 key={u.id}
                 onClick={() => toggleUser(u.id)}
                 className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                    ${isSelected 
                      ? 'bg-white border-gray-200 shadow-sm text-gray-800' 
                      : 'bg-gray-50 border-transparent text-gray-400 opacity-70 hover:opacity-100'}
                 `}
               >
                  <div 
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${isSelected ? '' : 'bg-gray-300'}`}
                    style={{ backgroundColor: isSelected ? color : undefined }} 
                  />
                  {getDisplayName(u)}
                  {isSelected ? <Eye size={12} className="text-gray-400" /> : <EyeOff size={12} />}
               </button>
             );
          })}
          {sortedUsers.length === 0 && <span className="text-gray-400 text-sm italic">Add users to view analytics</span>}
        </div>
      </div>
    </div>
  );
};

export default WeeklyAnalytics;