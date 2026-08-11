import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { getCategoryStyle } from '@/utils/categoryStyles';

export type SelectOption = string | { label: string; value: string; iconNode?: React.ReactNode };

interface CustomSelectProps {
  label?: React.ReactNode;
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isCategory?: boolean;
}

export default function CustomSelect({ label, options, value, onChange, placeholder = "Select option", isCategory = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to render selected value with icon
  const renderValue = () => {
    if (!value) {
      return <span className="text-[#2E1065]/40">{placeholder}</span>;
    }
    
    // Find label if it's an object option
    let displayValue = value;
    if (options.length > 0 && typeof options[0] !== 'string') {
      const selectedOpt = (options as {label: string, value: string}[]).find(o => o.value === value);
      if (selectedOpt) displayValue = selectedOpt.label;
    }
    
    if (isCategory) {
      const { icon: Icon, color, textColor } = getCategoryStyle(value);
      return (
        <span className="flex items-center gap-3 text-[#2E1065]">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${color} ${textColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          {displayValue}
        </span>
      );
    }
    
    // Check if custom icon provided
    const selectedOpt = options.length > 0 && typeof options[0] !== 'string' 
      ? (options as any).find((o: any) => o.value === value) 
      : null;
      
    if (selectedOpt && selectedOpt.iconNode) {
      return (
        <span className="flex items-center gap-3 text-[#2E1065]">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm bg-white/60 text-[#8B5CF6]">
            {selectedOpt.iconNode}
          </div>
          {displayValue}
        </span>
      );
    }

    return <span className="text-[#2E1065]">{displayValue}</span>;
  };

  return (
    <div>
      {label && <label className="block text-sm font-bold text-[#2E1065] mb-2">{label}</label>}
      
      {/* Trigger Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-[16px] px-4 py-3.5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 transition-all shadow-inner h-14"
      >
        <span className="font-bold text-[#2E1065] flex items-center h-full">
          {renderValue()}
        </span>
        <ChevronDown className="w-5 h-5 text-[#2E1065]/40" />
      </button>

      {/* Bottom Sheet Overlay */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[300] flex flex-col justify-end"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sheet (Glassmorphism) */}
          <div className="bg-white/80 backdrop-blur-[30px] rounded-t-[40px] w-full max-w-md mx-auto shadow-[0_-10px_40px_rgba(31,38,135,0.15)] border-t border-white/60 relative animate-slide-up pb-8 max-h-[70vh] flex flex-col">
            <div className="p-4 flex justify-center shrink-0">
              <div className="w-16 h-1.5 bg-slate-300/50 rounded-full" />
            </div>
            
            <div className="px-6 pb-4 shrink-0 flex items-center justify-between">
              <h3 className="text-[22px] font-bold text-[#2E1065]">
                {typeof label === 'string' ? label : 'เลือกตัวเลือก'}
              </h3>
            </div>

            <div className="overflow-y-auto px-4 pb-4 no-scrollbar">
              {options.map((opt, i) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = value === optValue;
                
                let IconComponent = null;
                let iconStyles = '';
                let CustomIcon = null;
                
                if (isCategory) {
                  const style = getCategoryStyle(optValue);
                  IconComponent = style.icon;
                  iconStyles = `${style.color} ${style.textColor}`;
                } else if (typeof opt !== 'string' && opt.iconNode) {
                  CustomIcon = opt.iconNode;
                }

                return (
                  <button
                    key={`${optValue}-${i}`}
                    type="button"
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 mb-2 rounded-2xl transition-all border ${
                      isSelected 
                        ? 'bg-[#F3E8FF] border-[#D8B4FE] shadow-sm' 
                        : 'bg-white/40 hover:bg-white/60 border border-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {(IconComponent || CustomIcon) && (
                        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center border border-white/50 shadow-sm ${IconComponent ? iconStyles : 'bg-white/60 text-[#8B5CF6]'}`}>
                          {IconComponent ? <IconComponent className="w-6 h-6" /> : CustomIcon}
                        </div>
                      )}
                      <span className={`font-bold text-[15px] ${isSelected ? 'text-[#8B5CF6]' : 'text-[#2E1065]'}`}>{optLabel}</span>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#8B5CF6]" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
              
              {options.length === 0 && (
                <div className="py-8 text-center font-semibold text-[#2E1065]/50 bg-white/40 rounded-[20px] border border-white/50 m-2">
                  No options available
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
