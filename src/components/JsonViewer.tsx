import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JsonViewerProps {
  data: any;
  title?: string;
  defaultExpanded?: boolean;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ 
  data, 
  title = 'Raw Data', 
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'JSON data copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
              onClick={handleCopy}
              title="Copy JSON"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 border-slate-200"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-slate-200">
            <code className="text-slate-700">{jsonString}</code>
          </pre>
        </CardContent>
      )}
    </Card>
  );
};

export default JsonViewer;
