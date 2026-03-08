import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Prediction } from '../types';
import { format } from 'date-fns';
import { Search as SearchIcon, TrendingUp, TrendingDown, Minus, Info, AlertCircle, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export default function Search() {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { data: results, isLoading, isError, refetch } = useQuery({
    queryKey: ['search', team1, team2],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }
      
      let query = supabase.from('predictions').select('*').order('match_date', { ascending: false });

      if (team1 && team2) {
        // Search for matches involving both teams
        query = query.or(`and(team_a.ilike.%${team1}%,team_b.ilike.%${team2}%),and(team_a.ilike.%${team2}%,team_b.ilike.%${team1}%)`);
      } else if (team1) {
        query = query.or(`team_a.ilike.%${team1}%,team_b.ilike.%${team1}%`);
      } else if (team2) {
        query = query.or(`team_a.ilike.%${team2}%,team_b.ilike.%${team2}%`);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Prediction[];
    },
    enabled: false, // Only run on manual trigger
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (team1 || team2) {
      setHasSearched(true);
      refetch();
    }
  };

  const totalProfit = results?.reduce((acc, curr) => acc + (curr.profit_loss || 0), 0) || 0;
  const wonBets = results?.filter(p => p.result === 'Won').length || 0;
  const totalBets = results?.length || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20"
    >
       <header className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">История поиска</h2>
        <p className="text-zinc-400 mt-1">Анализируйте прошлые матчи и результаты.</p>
      </header>

      <div className="glass-panel rounded-3xl p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <input 
                type="text" 
                placeholder="Команда 1 (например, NAVI)"
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                className="w-full glass-input px-6 py-4 text-sm focus:outline-none"
              />
            </div>
            <span className="text-zinc-600 font-bold text-xs uppercase">VS</span>
            <div className="flex-1 w-full">
              <input 
                type="text" 
                placeholder="Команда 2 (Опционально)"
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                className="w-full glass-input px-6 py-4 text-sm focus:outline-none"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={!team1 && !team2}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-6 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
          >
            <SearchIcon size={18} />
            Найти матч
          </button>
        </form>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center text-center space-y-2 backdrop-blur-sm">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <p className="text-sm text-rose-400">Не удалось выполнить поиск. Убедитесь, что переменные окружения Supabase настроены правильно.</p>
        </div>
      )}

      {hasSearched && !isError && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse flex space-x-4 p-4 text-zinc-400 justify-center">Поиск в базе данных...</div>
          ) : results && results.length > 0 ? (
            <>
              {/* Search Stats Summary */}
              <div className="glass-card rounded-[32px] p-5 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">Исторический профит</span>
                  <span className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} USD
                  </span>
                </div>
                <div className="text-right relative z-10">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">Винрейт</span>
                  <span className="text-2xl font-bold text-white">
                    {totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(0) : 0}%
                  </span>
                  <span className="text-xs text-zinc-500 ml-1">({wonBets}/{totalBets})</span>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-3">
                {results.map((pred) => (
                  <SearchResultCard key={pred.id} prediction={pred} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 glass-panel rounded-2xl border-dashed border-white/10">
              <Info className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Исторических данных для этого матча не найдено.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

const SearchResultCard: React.FC<{ prediction: Prediction }> = ({ prediction }) => {
  const isWin = prediction.result === 'Won';
  const isLoss = prediction.result === 'Lost';
  
  return (
    <div className="glass-card rounded-[32px] p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {prediction.tournament}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-white">{prediction.team_a}</span>
            <span className="text-zinc-600 text-xs font-medium">VS</span>
            <span className="font-bold text-white">{prediction.team_b}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-500">{format(new Date(prediction.match_date), 'MMM d, yyyy')}</span>
          <div className={`mt-1 flex items-center justify-end gap-1 text-sm font-bold ${
            isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-zinc-400'
          }`}>
            {isWin ? <TrendingUp size={14} /> : isLoss ? <TrendingDown size={14} /> : <Minus size={14} />}
            {prediction.profit_loss > 0 ? '+' : ''}{prediction.profit_loss}
          </div>
        </div>
      </div>
      
      <div className="bg-black/20 rounded-[24px] p-4 text-sm border border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-400">Выбор: <span className="text-zinc-200 font-medium">{prediction.prediction_text}</span></span>
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
            isWin ? 'bg-emerald-500/20 text-emerald-400' : 
            isLoss ? 'bg-rose-500/20 text-rose-400' : 
            'bg-zinc-800 text-zinc-300'
          }`}>
            {isWin ? 'Победа' : isLoss ? 'Поражение' : 'Возврат'}
          </span>
        </div>
        <div className="flex gap-4 text-xs text-zinc-500 font-medium">
          <span>Кэф: <span className="text-zinc-300">{prediction.odds}</span></span>
          <span>Ставка: <span className="text-zinc-300">${prediction.stake}</span></span>
        </div>
        {prediction.notes && (
          <div className="mt-3 pt-3 border-t border-white/5 text-zinc-400 text-xs italic">
            "{prediction.notes}"
          </div>
        )}
      </div>
    </div>
  );
}
