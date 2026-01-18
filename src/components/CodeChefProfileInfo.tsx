import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School, MapPin } from 'lucide-react';

interface CodeChefProfileInfoProps {
  institution?: string;
  country?: string;
  className?: string;
}

const CodeChefProfileInfo: React.FC<CodeChefProfileInfoProps> = ({
  institution = '',
  country = '',
  className = ""
}) => {
  if (!institution && !country) {
    return (
      <Card className={`bg-card border-border/50 ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <School className="w-5 h-5 text-amber-600" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <School className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No profile information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-heading flex items-center gap-2">
          <School className="w-5 h-5 text-amber-600" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {institution && (
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <School className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Institution</div>
                <div className="font-semibold text-foreground">{institution}</div>
              </div>
            </div>
          )}

          {country && (
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Country</div>
                <div className="font-semibold text-foreground">{country}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeChefProfileInfo;

