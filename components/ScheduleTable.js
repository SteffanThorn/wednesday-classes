'use client';

import { useLanguage } from '@/hooks/useLanguage';

const ScheduleTable = ({ schedule }) => {
  const { t, mounted } = useLanguage();

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-glow-cyan/20">
            <th className="py-4 px-4 text-left font-display text-lg text-foreground">
              {mounted ? t('day') : 'Day'}
            </th>
            <th className="py-4 px-4 text-left font-display text-lg text-foreground">
              {mounted ? t('time') : 'Time'}
            </th>
            <th className="py-4 px-4 text-left font-display text-lg text-foreground">
              {mounted ? t('class') : 'Class'}
            </th>
            <th className="py-4 px-4 text-left font-display text-lg text-foreground">
              {mounted ? t('teacher') : 'Teacher'}
            </th>
            <th className="py-4 px-4 text-left font-display text-lg text-foreground">
              {mounted ? t('spots') : 'Spots'}
            </th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((slot, index) => (
            <tr 
              key={index}
              className="border-b border-border/50 hover:bg-glow-cyan/5 transition-colors duration-300"
            >
              <td className="py-4 px-4 text-muted-foreground">
                {mounted ? t(slot.dayKey) : slot.dayKey}
              </td>
              <td className="py-4 px-4 text-muted-foreground">
                {slot.time}
              </td>
              <td className="py-4 px-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                               bg-glow-cyan/10 text-glow-cyan border border-glow-cyan/30">
                  {mounted ? t(slot.classKey) : slot.classKey}
                </span>
              </td>
              <td className="py-4 px-4 text-muted-foreground">
                {slot.teacher}
              </td>
              <td className="py-4 px-4">
                <span className={`text-sm ${slot.spots > 3 ? 'text-glow-teal' : 'text-warm-coral'}`}>
                  {slot.spots} {mounted ? t('available') : 'available'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;

