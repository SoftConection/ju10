import React from 'react';

interface EventDescriptionProps {
  description: string;
}

export const EventDescription: React.FC<EventDescriptionProps> = ({
  description
}) => {
  return (
    <section className="flex flex-col items-start gap-4 self-stretch relative">
      <div className="flex flex-col items-start gap-4 self-stretch relative">
        <hr className="h-px self-stretch relative bg-border border-0" />
        <h2 className="self-stretch text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Sobre este evento
        </h2>
      </div>
      <p className="self-stretch text-foreground text-base leading-relaxed">
        {description}
      </p>
    </section>
  );
};
