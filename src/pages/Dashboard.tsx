import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Prediction } from '../types';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Calendar, Trophy, AlertTriangle, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { data: predictions, isLoading, isError } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('match_date', { ascending: false });
      
      if (error) throw error;
      return data as Prediction[];
    },
    enabled: isSupabaseConfigured(),
  });

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 glass-panel rounded-3xl">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
          <Database className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Отсутствует подключение к базе данных</h2>
        <p className="text-zinc-400 max-w-md mb-6">
          Пожалуйста, настройте учетные данные Supabase в переменных окружения, чтобы начать отслеживать прогнозы.
        </p>
        <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-left w-full max-w-sm">
          <p className="text-xs text-zinc-500 font-mono mb-2">Необходимые переменные:</p>
          <code className="block text-xs text-emerald-400 font-mono">VITE_SUPABASE_URL</code>
          <code className="block text-xs text-emerald-400 font-mono mt-1">VITE_SUPABASE_ANON_KEY</code>
        </div>
      </div>
    );
  }

  const totalProfit = predictions?.reduce((acc, curr) => acc + (curr.profit_loss || 0), 0) || 0;
  const wonBets = predictions?.filter(p => p.result === 'Won').length || 0;
  const totalBets = predictions?.length || 0;
  const winRate = totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(0) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Дашборд</h2>
          <p className="text-zinc-400 mt-1">С возвращением, вот ваша статистика.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard 
          label="Общий профит" 
          value={`${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`} 
          trend={totalProfit >= 0 ? 'up' : 'down'}
          highlight
        />
        <StatCard 
          label="Винрейт" 
          value={`${winRate}%`} 
          subtext={`${wonBets}/${totalBets} Побед`}
        />
        <StatCard 
          label="Всего ставок" 
          value={totalBets.toString()} 
          subtext="За все время"
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-zinc-400" />
          Недавняя активность
        </h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 glass-card rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 glass-panel rounded-[32px] text-center border-rose-500/20">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-rose-400">Не удалось загрузить прогнозы. Проверьте соединение.</p>
          </div>
        ) : predictions && predictions.length > 0 ? (
          <div className="grid gap-3">
            {predictions.map((pred) => (
              <PredictionCard key={pred.id} prediction={pred} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-[32px] border-dashed border-white/10">
            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">Прогнозов пока нет</p>
            <p className="text-zinc-600 text-sm mt-1">Начните с добавления вашего первого прогноза</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, subtext, trend, highlight, className = '' }: { 
  label: string; 
  value: string; 
  subtext?: string; 
  trend?: 'up' | 'down';
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`glass-card p-6 rounded-[32px] flex flex-col justify-between relative overflow-hidden ${className}`}>
      {highlight && (
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-zinc-800/50 blur-2xl rounded-full" />
      )}
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider z-10">{label}</span>
      <div className="mt-2 z-10">
        <div className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          {value}
          {trend && (
            <span className={`text-sm p-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            </span>
          )}
        </div>
        {subtext && <span className="text-xs text-zinc-500 font-medium mt-1 block">{subtext}</span>}
      </div>
    </div>
  );
}

const PredictionCard: React.FC<{ prediction: Prediction }> = ({ prediction }) => {
  const isWin = prediction.result === 'Won';
  const isLoss = prediction.result === 'Lost';
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-6 rounded-[32px] group cursor-default"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
              {prediction.tournament}
            </span>
            <span className="text-xs text-zinc-500">{format(new Date(prediction.match_date), 'MMM d')}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg">{prediction.team_a}</span>
              <span className="text-zinc-600 text-xs font-medium">VS</span>
              <span className="font-bold text-white text-lg">{prediction.team_b}</span>
            </div>
          </div>
          
          <p className="text-sm text-zinc-400 mt-2 line-clamp-1 group-hover:text-zinc-300 transition-colors">
            <span className="text-zinc-600 mr-1">Pick:</span> {prediction.prediction_text}
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className={`
            flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2
            ${isWin ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 
              isLoss ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' : 
              'bg-zinc-800 text-zinc-400 border border-zinc-700'}
          `}>
            {isWin ? 'Won' : isLoss ? 'Lost' : 'Refund'}
          </div>
          <span className={`text-lg font-bold tabular-nums ${
            isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-zinc-400'
          }`}>
            {prediction.profit_loss > 0 ? '+' : ''}{prediction.profit_loss}
          </span>
          <span className="text-[10px] text-zinc-600 font-medium mt-0.5">
            {prediction.odds}x • ${prediction.stake}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
