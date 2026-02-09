import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface EventLocationProps {
  address: string;
  onGetDirections: () => void;
}

export const EventLocation: React.FC<EventLocationProps> = ({ 
  address, 
  onGetDirections 
}) => {
  const encodedAddress = encodeURIComponent(address);
  
  return (
    <section className="flex flex-col items-start gap-4 self-stretch relative">
      <div className="flex flex-col items-start gap-4 self-stretch relative">
        <hr className="h-px self-stretch relative bg-border border-0" />
        <h2 className="self-stretch text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Localização
        </h2>
      </div>
      <div className="flex items-start gap-6 self-stretch relative max-sm:flex-col max-sm:gap-4">
        <div className="flex items-start gap-3 flex-1">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <address className="flex-1 text-foreground text-base leading-relaxed not-italic">
            {address}
          </address>
        </div>
        <a 
          href={`https://maps.google.com/?q=${encodedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wide hover:text-primary/80 transition-colors whitespace-nowrap"
        >
          <span>Ver direções</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="w-full rounded-xl overflow-hidden shadow-soft">
        <iframe
          src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
          className="h-[200px] md:h-[240px] self-stretch relative w-full border-0"
          loading="lazy"
          title="Mapa do local do evento"
        />
      </div>
    </section>
  );
};
