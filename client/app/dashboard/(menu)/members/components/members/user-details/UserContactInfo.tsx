import { UserProfile } from '@/data/types';
import { Book, Mail, MapPin, Phone } from 'lucide-react';

interface UserContactInfoProps {
  user: UserProfile;
}

export function UserContactInfo({ user }: UserContactInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span>{user.email}</span>
      </div>
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span>{user.whatsapp || 'Not provided'}</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{user.hometown}</span>
      </div>
      <div className="flex items-center gap-2">
        <Book className="h-4 w-4 text-muted-foreground" />
        <span>Session: {user.session}</span>
      </div>
    </div>
  );
}
