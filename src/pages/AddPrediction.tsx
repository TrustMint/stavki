import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Save, AlertCircle, Calendar, Trophy, Target } from 'lucide-react';

const predictionSchema = z.object({
  match_date: z.string().min(1, 'Дата обязательна'),
  team_a: z.string().min(1, 'Команда A обязательна'),
  team_b: z.string().min(1, 'Команда B обязательна'),
  tournament: z.string().min(1, 'Турнир обязателен'),
  prediction_text: z.string().min(1, 'Прогноз обязателен'),
  odds: z.number().min(1, 'Коэффициент должен быть больше 1'),
  stake: z.number().min(0, 'Ставка должна быть положительной'),
  result: z.enum(['Won', 'Lost', 'Refunded']),
  profit_loss: z.number(),
  notes: z.string().optional(),
});

type PredictionFormValues = z.infer<typeof predictionSchema>;

export default function AddPrediction() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      match_date: new Date().toISOString().split('T')[0],
      result: 'Won',
      odds: 1.85,
      stake: 100,
      profit_loss: 85,
    }
  });

  const mutation = useMutation({
    mutationFn: async (newPrediction: PredictionFormValues) => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
      }
      const { data, error } = await supabase
        .from('predictions')
        .insert([newPrediction])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      navigate('/');
    },
  });

  const onSubmit = (data: PredictionFormValues) => {
    mutation.mutate(data);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-xl mx-auto pb-20"
    >
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Новый прогноз</h2>
        <p className="text-zinc-400 mt-1">Запишите результат нового матча.</p>
      </header>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="glass-panel rounded-3xl p-6 space-y-6">
          
          {/* Match Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Calendar size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Детали матча</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Дата</label>
                <input 
                  type="date" 
                  {...register('match_date')}
                  className="w-full glass-input px-6 py-4 text-sm focus:outline-none"
                />
                {errors.match_date && <span className="text-xs text-rose-400 mt-1 ml-1">{errors.match_date.message}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Турнир</label>
                <div className="relative">
                  <Trophy className="absolute left-3 top-3 text-zinc-500 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="IEM Katowice"
                    {...register('tournament')}
                    className="w-full glass-input pl-12 pr-6 py-4 text-sm focus:outline-none"
                  />
                </div>
                {errors.tournament && <span className="text-xs text-rose-400 mt-1 ml-1">{errors.tournament.message}</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Команды</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Команда A"
                    {...register('team_a')}
                    className="w-full glass-input px-6 py-4 text-sm focus:outline-none text-center font-bold"
                  />
                </div>
                <span className="text-zinc-500 font-bold text-xs">VS</span>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Команда B"
                    {...register('team_b')}
                    className="w-full glass-input px-6 py-4 text-sm focus:outline-none text-center font-bold"
                  />
                </div>
              </div>
              {(errors.team_a || errors.team_b) && <span className="text-xs text-rose-400 mt-1 ml-1">Обе команды обязательны</span>}
            </div>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Prediction Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Target size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Прогноз</h3>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Ваш выбор</label>
              <input 
                type="text" 
                placeholder="например, победа NAVI на 1 карте"
                {...register('prediction_text')}
                className="w-full glass-input px-6 py-4 text-sm focus:outline-none"
              />
              {errors.prediction_text && <span className="text-xs text-rose-400 mt-1 ml-1">{errors.prediction_text.message}</span>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Кэф</label>
                <input 
                  type="number" 
                  step="0.01"
                  {...register('odds', { valueAsNumber: true })}
                  className="w-full glass-input px-4 py-4 text-sm focus:outline-none text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Ставка ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  {...register('stake', { valueAsNumber: true })}
                  className="w-full glass-input px-4 py-4 text-sm focus:outline-none text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">P/L ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  {...register('profit_loss', { valueAsNumber: true })}
                  className="w-full glass-input px-4 py-4 text-sm focus:outline-none text-center font-bold text-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 ml-1">Результат</label>
              <div className="grid grid-cols-3 gap-2">
                {['Won', 'Lost', 'Refunded'].map((res) => (
                  <label key={res} className="relative cursor-pointer group">
                    <input 
                      type="radio" 
                      value={res} 
                      {...register('result')}
                      className="peer sr-only"
                    />
                    <div className="w-full text-center px-3 py-4 text-sm font-medium rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all peer-checked:border-emerald-500/50 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-500 group-hover:bg-zinc-800">
                      {res === 'Won' ? 'Победа' : res === 'Lost' ? 'Поражение' : 'Возврат'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Заметки (Опционально)</label>
              <textarea 
                {...register('notes')}
                rows={3}
                className="w-full glass-input rounded-3xl px-6 py-4 text-sm focus:outline-none resize-none"
                placeholder="Стратегия или мысли..."
              />
            </div>
          </div>
        </div>

        {mutation.isError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-400">Не удалось сохранить прогноз. Убедитесь, что Supabase настроен правильно.</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 px-8 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Сохранение...' : (
            <>
              <Save size={20} />
              Сохранить прогноз
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
