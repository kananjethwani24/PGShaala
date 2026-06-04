import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarCheck } from 'lucide-react';
import { useCreateVisit } from '@/hooks/useCrmData';
import { toast } from 'sonner';

interface Props {
  leadId: string;
  propertyId: string;
  propertyName: string;
  children?: React.ReactNode;
}

export default function ScheduleTourDialog({ leadId, propertyId, propertyName, children }: Props) {
  const [open, setOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const createVisit = useCreateVisit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error('Date and time are required');
      return;
    }

    try {
      await createVisit.mutateAsync({
        lead_id: leadId,
        property_id: propertyId,
        scheduled_at: new Date(scheduledAt).toISOString(),
      });
      toast.success('Tour scheduled!');
      setOpen(false);
      setScheduledAt('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule tour');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <CalendarCheck size={14} /> TOUR
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Schedule Tour</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-2">
          Target: <span className="font-semibold text-foreground">{propertyName}</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Date & Time *</Label>
            <Input 
              type="datetime-local" 
              value={scheduledAt} 
              onChange={e => setScheduledAt(e.target.value)} 
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={createVisit.isPending}>
              {createVisit.isPending ? 'Scheduling...' : 'Confirm Tour'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
