import React, { useTransition, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/data/types';
import { getUserById } from '../../actions';
import { UserProfileHeader } from './user-details/UserProfileHeader';
import { UserContactInfo } from './user-details/UserContactInfo';
import { UserEducation } from './user-details/UserEducation';
import { UserExtras } from './user-details/UserExtras';
import { SendCredentialsForm } from './user-details/SendCredentialsForm';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  onOpenChange,
  userId,
}) => {
  const [userDetails, setUserDetails] = useState<UserProfile | null>(null);
  const [showSendCred, setShowSendCred] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Fetch user whenever the dialog opens with a valid userId
  React.useEffect(() => {
    if (!open || !userId) return;

    setUserDetails(null);
    setShowSendCred(false);

    startTransition(async () => {
      const response = await getUserById(userId);
      if (response.status === 200) {
        setUserDetails(response.data as UserProfile);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load user details.',
          variant: 'destructive',
        });
      }
    });
  }, [userId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>

          {/* Send Credentials section */}
          <div className="m-5 p-2 rounded-md w-full">
            {!showSendCred ? (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={() => setShowSendCred(true)}
                disabled={isPending || !userDetails}
              >
                Send Credentials
              </button>
            ) : (
              userDetails && (
                <SendCredentialsForm
                  regno={userDetails.regno}
                  defaultEmail={userDetails.email || ''}
                  onCancel={() => setShowSendCred(false)}
                />
              )
            )}
          </div>
        </DialogHeader>

        {/* Loading state */}
        {isPending && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Loading user details...
          </div>
        )}

        {/* User content */}
        {!isPending && userDetails && (
          <div className="space-y-6">
            <UserProfileHeader user={userDetails} />

            <Separator />

            <UserContactInfo user={userDetails} />

            <Separator />

            <UserEducation user={userDetails} />

            <UserExtras user={userDetails} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
