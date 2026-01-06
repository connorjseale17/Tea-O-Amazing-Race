import React, { useState } from 'react';
import { User } from '../types';
import { STEPS_PER_MILE, TOTAL_GOAL_STEPS } from '../constants';
import { ClipboardCopy, Download } from 'lucide-react';

interface ReportGeneratorProps {
  users: User[];
  totalSteps: number;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ users, totalSteps }) => {
  const [copied, setCopied] = useState(false);

  const getDisplayName = (u: User) => u.teamName ? `${u.teamName} (${u.name})` : u.name;

  const generateReport = () => {
    const sorted = [...users].sort((a, b) => (b.steps || 0) - (a.steps || 0));
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const percent = ((totalSteps / TOTAL_GOAL_STEPS) * 100).toFixed(2);
    const totalMiles = (totalSteps / STEPS_PER_MILE).toFixed(1);

    return `
🏁 TEA&O AMAZING RACE UPDATE 🏁

🌍 Distance Covered: ${totalMiles} miles
📊 Race Progress: ${percent}%

🏆 WALKER SPOTLIGHT:
${top ? `${getDisplayName(top)} is leading the pack with ${(top.steps || 0).toLocaleString()} steps!` : 'No data yet.'}

🐢 SLACKER ALERT:
${bottom ? `Come on ${getDisplayName(bottom)}, pick up the pace! (${(bottom.steps || 0).toLocaleString()} steps)` : 'No data yet.'}

#TeaAndOAmazingRace #StepChallenge
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "race_data.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return (
    <div className="flex flex-wrap gap-4 mt-8 justify-center">
      <button 
        onClick={handleCopy}
        className="flex items-center gap-2 bg-[#4285F4] hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-sm"
      >
        <ClipboardCopy size={18} />
        {copied ? 'Copied!' : 'Share Update'}
      </button>

       <button 
        onClick={downloadData}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-full font-medium transition-colors border border-gray-300 shadow-sm"
      >
        <Download size={18} />
        Export Data
      </button>
    </div>
  );
};

export default ReportGenerator;