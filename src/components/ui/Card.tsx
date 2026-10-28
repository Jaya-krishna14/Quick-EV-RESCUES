import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  onAction: () => void;
  variant?: 'primary' | 'secondary';
}

export function ServiceCard({ title, description, icon: Icon, buttonText, onAction, variant = 'primary' }: ServiceCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <div className="p-6 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${variant === 'primary' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
      </div>
      <div className="p-6 pt-0">
        <button
          onClick={onAction}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all active:scale-[0.98] ${
            variant === 'primary' 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/10' 
              : 'bg-navy-900 text-white hover:bg-navy-800 shadow-lg shadow-navy-900/10'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </Card>
  );
}
