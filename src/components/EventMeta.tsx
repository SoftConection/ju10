import React from 'react';

interface EventMetaProps {
  date: string;
  time: string;
}

export const EventMeta: React.FC<EventMetaProps> = ({ date, time }) => {
  return (
    <div className="flex items-center gap-2 relative">
      <div className="flex justify-center items-center gap-2.5 relative bg-primary px-3 py-1.5 rounded-lg">
        <time className="text-primary-foreground text-xs font-semibold uppercase tracking-wide">
          {date}
        </time>
      </div>
      <div className="flex justify-center items-center gap-2.5 border-2 relative px-3 py-1.5 rounded-lg border-primary">
        <time className="text-primary text-xs font-semibold uppercase tracking-wide">
          {time}
        </time>
      </div>
    </div>
  );
};
