import React, { useState } from 'react';
import { User } from '../types';
import { MAX_USERS } from '../constants';
import { 
  Plus, Check, UserPlus, X, Trash2,
  Zap, Star, Heart, Trophy, Crown, Smile, 
  Ghost, Cat, Dog, Fish, Bird, Bug, 
  Flower, TreePine, Sun, Moon, Cloud, Flame, Droplets, Rocket
} from 'lucide-react';

// --- ICON LIBRARY CONFIGURATION ---
const ICON_LIBRARY = [
  { id: 'cat', icon: Cat, color: 'bg-orange-100 text-orange-600', label: 'Cat' },
  { id: 'dog', icon: Dog, color: 'bg-amber-100 text-amber-700', label: 'Dog' },
  { id: 'bird', icon: Bird, color: 'bg-sky-100 text-sky-600', label: 'Bird' },
  { id: 'fish', icon: Fish, color: 'bg-blue-100 text-blue-600', label: 'Fish' },
  { id: 'bug', icon: Bug, color: 'bg-lime-100 text-lime-600', label: 'Bug' },
  { id: 'flower', icon: Flower, color: 'bg-pink-100 text-pink-600', label: 'Flower' },
  { id: 'tree', icon: TreePine, color: 'bg-green-100 text-green-700', label: 'Tree' },
  { id: 'sun', icon: Sun, color: 'bg-yellow-100 text-yellow-600', label: 'Sun' },
  { id: 'moon', icon: Moon, color: 'bg-indigo-100 text-indigo-600', label: 'Moon' },
  { id: 'cloud', icon: Cloud, color: 'bg-slate-100 text-slate-600', label: 'Cloud' },
  { id: 'fire', icon: Flame, color: 'bg-red-100 text-red-600', label: 'Fire' },
  { id: 'water', icon: Droplets, color: 'bg-cyan-100 text-cyan-600', label: 'Water' },
  { id: 'zap', icon: Zap, color: 'bg-yellow-200 text-yellow-700', label: 'Spark' },
  { id: 'star', icon: Star, color: 'bg-purple-100 text-purple-600', label: 'Star' },
  { id: 'heart', icon: Heart, color: 'bg-rose-100 text-rose-600', label: 'Heart' },
  { id: 'trophy', icon: Trophy, color: 'bg-amber-200 text-amber-800', label: 'Trophy' },
  { id: 'crown', icon: Crown, color: 'bg-fuchsia-100 text-fuchsia-600', label: 'Royal' },
  { id: 'smile', icon: Smile, color: 'bg-teal-100 text-teal-600', label: 'Happy' },
  { id: 'ghost', icon: Ghost, color: 'bg-gray-200 text-gray-700', label: 'Ghost' },
  { id: 'rocket', icon: Rocket, color: 'bg-violet-100 text-violet-600', label: 'Rocket' },
];

interface AddStepsFormProps {
  users: User[];
  onAddSteps: (userId: string, steps: number) => void;
  onAddUser: (name: string, teamName: string, iconId: string) => void;
  onRemoveUser: (userId: string) => void;
}

const AddStepsForm: React.FC<AddStepsFormProps> = ({ users, onAddSteps, onAddUser, onRemoveUser }) => {
  // Modes: 'view', 'add-steps', 'create-user'
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  // Form States
  const [stepInput, setStepInput] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('smile');

  // Helpers
  const emptySlotsCount = Math.max(0, MAX_USERS - users.length);
  const emptySlots = Array.from({ length: emptySlotsCount }, (_, i) => i);
  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && stepInput) {
      onAddSteps(selectedUserId, parseInt(stepInput));
      setStepInput('');
      setSelectedUserId(null); 
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName && selectedIconId) {
      onAddUser(newUserName, newTeamName, selectedIconId);
      setNewUserName('');
      setNewTeamName('');
      setSelectedIconId('smile');
      setIsCreatingUser(false);
    }
  };

  const handleRemoveClick = () => {
    if (selectedUserId) {
        onRemoveUser(selectedUserId);
        setSelectedUserId(null);
    }
  }

  const getIconComponent = (iconId: string) => {
    const config = ICON_LIBRARY.find(i => i.id === iconId) || ICON_LIBRARY[0];
    const Icon = config.icon;
    return <div className={`p-3 rounded-full ${config.color}`}><Icon size={32} /></div>;
  };

  const getDisplayName = (u: User) => u.teamName ? u.teamName : u.name;
  const getSubtext = (u: User) => u.teamName ? u.name : null;

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
        <div>
          <h3 className="text-2xl font-normal text-gray-800">Team Roster</h3>
          <p className="text-gray-500 mt-1">
             Select a racer to log activity or fill an empty slot to join the race.
             <span className="ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
               {users.length}/{MAX_USERS} Spots Filled
             </span>
          </p>
        </div>
        
        {/* Contextual Actions */}
        {selectedUserId && (
           <button onClick={() => setSelectedUserId(null)} className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors bg-gray-50 px-4 py-2 rounded-full">
             <X size={18} /> Cancel Selection
           </button>
        )}
        {isCreatingUser && (
           <button onClick={() => setIsCreatingUser(false)} className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors bg-gray-50 px-4 py-2 rounded-full">
             <X size={18} /> Cancel Creation
           </button>
        )}
      </div>

      {/* --- ADD STEPS MODAL / INLINE FORM --- */}
      {selectedUser && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8 animate-fade-in relative">
           
           <div className="flex flex-col md:flex-row items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="transform scale-125">
                  {getIconComponent(selectedUser.iconId)}
                </div>
                <div>
                   <h4 className="text-xl font-bold text-gray-800">{getDisplayName(selectedUser)}</h4>
                   <p className="text-sm text-gray-500">
                      {getSubtext(selectedUser) ? `${getSubtext(selectedUser)} • ` : ''} 
                      {selectedUser.steps.toLocaleString()} steps
                   </p>
                </div>
             </div>
             <form onSubmit={handleStepSubmit} className="flex-1 w-full flex gap-3">
                <input 
                  type="number" 
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  placeholder="Enter daily steps..."
                  autoFocus
                  className="flex-1 bg-white border border-gray-200 text-lg rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  required
                  min="1"
                />
                <button 
                  type="submit"
                  className="bg-[#4285F4] hover:bg-blue-600 text-white px-8 rounded-xl font-medium transition-colors shadow-md flex items-center gap-2"
                >
                  <Check size={24} /> Log Steps
                </button>
             </form>
           </div>
           
           {/* Remove User Action */}
           <div className="mt-6 pt-4 border-t border-blue-200/50 flex justify-end">
              <button 
                onClick={handleRemoveClick}
                className="flex items-center gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                title="Remove this racer from the competition"
              >
                  <Trash2 size={16} /> Remove Racer
              </button>
           </div>
        </div>
      )}

      {/* --- CREATE USER FORM --- */}
      {isCreatingUser && (
        <form onSubmit={handleCreateUser} className="bg-green-50/50 border border-green-100 rounded-2xl p-6 mb-8 animate-fade-in">
           <div className="flex flex-col gap-6">
              
              {/* Name Inputs */}
              <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">1. Real Name</label>
                    <input 
                      type="text" 
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. John Smith"
                      autoFocus
                      className="w-full bg-white border border-gray-200 text-lg rounded-xl p-4 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                      required
                    />
                 </div>
                 <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">2. Team / Racer Name (Optional)</label>
                    <input 
                      type="text" 
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="e.g. Speedy Feet"
                      className="w-full bg-white border border-gray-200 text-lg rounded-xl p-4 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                    />
                 </div>
              </div>

              {/* Submit Button & Icon Select */}
              <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">3. Choose Your Avatar</label>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                      {ICON_LIBRARY.map((item) => {
                        const Icon = item.icon;
                        const isSelected = selectedIconId === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedIconId(item.id)}
                            className={`
                              aspect-square rounded-xl flex items-center justify-center transition-all duration-200
                              ${isSelected 
                                ? 'bg-white ring-4 ring-green-400 shadow-md scale-110 z-10' 
                                : 'bg-white hover:bg-gray-50 border border-gray-200 opacity-70 hover:opacity-100 hover:scale-105'}
                            `}
                          >
                             <div className={`${item.color} p-2 rounded-full`}>
                               <Icon size={24} />
                             </div>
                          </button>
                        )
                      })}
                    </div>
                 </div>
                 <div className="flex items-end">
                    <button 
                      type="submit"
                      className="bg-[#34A853] hover:bg-green-600 text-white px-8 py-4 rounded-xl font-medium transition-colors shadow-md flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                      <UserPlus size={24} /> Join Race
                    </button>
                 </div>
              </div>
           </div>
        </form>
      )}

      {/* --- ROSTER GRID --- */}
      {!isCreatingUser && !selectedUser && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          {/* Active Users */}
          {users.map((u) => {
             const displayName = getDisplayName(u);
             const subText = getSubtext(u);
             
             return (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className="group bg-white border border-gray-200 hover:border-blue-400 hover:shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-200 text-center gap-3 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  {getIconComponent(u.iconId)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg leading-tight truncate w-full px-1">{displayName}</h4>
                  {subText && (
                    <p className="text-xs text-gray-500 font-medium mt-0.5 truncate w-full px-1">{subText}</p>
                  )}
                  <p className="text-xs text-blue-500 font-bold mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded-full">{u.steps.toLocaleString()} steps</p>
                </div>
              </button>
            );
          })}

          {/* Empty Slots */}
          {emptySlots.map((_, i) => (
            <button
              key={`empty-${i}`}
              onClick={() => setIsCreatingUser(true)}
              disabled={isCreatingUser}
              className="group border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50/30 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-200 gap-2 min-h-[180px]"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-green-100 text-gray-400 group-hover:text-green-600 flex items-center justify-center transition-colors">
                <Plus size={32} />
              </div>
              <span className="text-sm font-bold text-gray-400 group-hover:text-green-600 uppercase tracking-wider">
                Open Spot
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddStepsForm;