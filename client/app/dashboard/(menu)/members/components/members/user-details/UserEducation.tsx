import { UserProfile } from '@/data/types';
import { School } from 'lucide-react';

interface UserEducationProps {
  user: UserProfile;
}

export function UserEducation({ user }: UserEducationProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Education</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <School className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">College:</span>
          <span>{user.college}</span>
        </div>
        <div className="flex items-center gap-2">
          <School className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">School:</span>
          <span>{user.school}</span>
        </div>
      </div>
    </div>
  );
}
