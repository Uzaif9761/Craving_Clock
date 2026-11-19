import React, { useEffect, useState } from 'react';

interface SlotTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  type?: 'price' | 'stock';
  className?: string;
}

export const SlotTicker: React.FC<SlotTickerProps> = ({
  value,
  prefix = '',
  suffix = '',
  type = 'price',
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setAnimate(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimate(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  if (type === 'stock') {
    let urgencyBadge = {
      label: 'High Stock',
      bg: 'bg-[#2EC4B6]/15',
      text: 'text-[#2EC4B6]',
      border: 'border-[#2EC4B6]/30',
      dot: 'bg-[#2EC4B6]'
    };

    if (value === 0) {
      urgencyBadge = {
        label: 'Sold Out',
        bg: 'bg-neutral-800/80',
        text: 'text-neutral-400',
        border: 'border-neutral-700',
        dot: 'bg-neutral-500'
      };
    } else if (value <= 5) {
      urgencyBadge = {
        label: 'Last Few Plates!',
        bg: 'bg-[#E71D36]/20',
        text: 'text-[#E71D36]',
        border: 'border-[#E71D36]/40',
        dot: 'bg-[#E71D36] animate-ping'
      };
    } else if (value <= 20) {
      urgencyBadge = {
        label: 'Filling Fast',
        bg: 'bg-[#FF9F1C]/20',
        text: 'text-[#FF9F1C]',
        border: 'border-[#FF9F1C]/40',
        dot: 'bg-[#FF9F1C]'
      };
    }

    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${urgencyBadge.bg} ${urgencyBadge.text} ${urgencyBadge.border} ${className}`}>
        <span className={`w-2 h-2 rounded-full ${urgencyBadge.dot}`} />
        <span className={animate ? 'animate-slot-slide inline-block' : 'inline-block'}>
          {value} {suffix || 'plates left'}
        </span>
        <span className="text-[10px] opacity-75 hidden sm:inline">({urgencyBadge.label})</span>
      </div>
    );
  }

  // Price Ticker
  return (
    <div className={`inline-flex items-baseline font-mono font-bold text-lg text-[#FF9F1C] ${className}`}>
      {prefix && <span className="text-sm mr-0.5">{prefix}</span>}
      <span className={animate ? 'animate-slot-slide text-white inline-block' : 'inline-block'}>
        {value.toFixed(2)}
      </span>
      {suffix && <span className="text-xs ml-1 text-neutral-400">{suffix}</span>}
    </div>
  );
};
