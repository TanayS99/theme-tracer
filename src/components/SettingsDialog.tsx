
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setUseRealAPI, getUseRealAPI } from '@/api/realRedditAPI';
import { useToast } from '@/hooks/use-toast';

export const SettingsDialog = () => {
  const [useRealAPI, setUseRealAPIState] = React.useState(() => getUseRealAPI());
  const { toast } = useToast();
  
  const handleToggleRealAPI = (checked: boolean) => {
    setUseRealAPI(checked);
    setUseRealAPIState(checked);
    
    // Show a toast notification when the setting changes
    toast({
      title: checked ? "Using Real Reddit API" : "Using Mock Data",
      description: checked 
        ? "Now fetching real data from Reddit" 
        : "Now using simulated data for demos",
      duration: 3000,
    });
    
    console.log("API mode toggled:", checked ? "real" : "mock");
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-10 w-10 border border-primary/30 hover:border-primary hover:bg-secondary relative"
          title="Settings"
        >
          <Settings className="h-5 w-5 text-primary" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure application settings and preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="use-real-api">Use Real Reddit API</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between mock data and real Reddit API
              </p>
            </div>
            <Switch 
              id="use-real-api" 
              checked={useRealAPI}
              onCheckedChange={handleToggleRealAPI}
            />
          </div>
          
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Note:</strong> The Reddit API has rate limits and may require authentication for some endpoints.
            </p>
            <p className="text-sm text-muted-foreground">
              This is a frontend-only application, so API credentials are not stored securely. For a production application, these should be handled by a backend service.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
