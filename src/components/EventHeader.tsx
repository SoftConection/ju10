import React from 'react';

interface EventHeaderProps {
  title: string;
  creator: string;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ title, creator }) => {
  return (
    <div className="flex flex-col items-start gap-3 self-stretch relative">
      <header>
        <h1 className="self-stretch text-foreground text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight font-display">
          {title}
        </h1>
      </header>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Por
        </span>
        <span className="text-primary text-xs font-semibold uppercase tracking-wider">
          {creator}
        </span>
      </div>
    </div>
  );
};
