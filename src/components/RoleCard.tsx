import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  onClick: () => void;
  delay?: number;
}

const RoleCard: React.FC<RoleCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  gradient,
  onClick,
  delay = 0
}) => {
  return (
    <Card 
      className="group cursor-pointer card-hover bg-card border-border/50 overflow-hidden"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-0">
        <div className={`${gradient} p-8 flex justify-center items-center`}>
          <div className="w-24 h-24 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleCard;
