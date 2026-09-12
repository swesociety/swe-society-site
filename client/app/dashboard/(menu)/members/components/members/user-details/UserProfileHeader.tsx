import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/data/types';
import { Facebook, FileText, Github, Linkedin } from 'lucide-react';

interface UserProfileHeaderProps {
  user: UserProfile;
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src={user.profile_picture} alt={user.fullname} />
        <AvatarFallback>
          {user.fullname ? user.fullname.substring(0, 2) : 'NA'}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{user.fullname}</h2>

        <div className="flex items-center gap-2">
          <Badge>{user.role}</Badge>
          {user.is_alumni && <Badge variant="secondary">Alumni</Badge>}
          <Badge variant="outline">{user.blood_group}</Badge>
        </div>

        <div className="flex gap-2">
          {user.github_id && (
            <a href={user.github_id} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <Github className="h-4 w-4" />
              </Button>
            </a>
          )}
          {user.linkedin_id && (
            <a href={user.linkedin_id} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
            </a>
          )}
          {user.facebook_id && (
            <a href={user.facebook_id} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
            </a>
          )}
          {user.cv && (
            <a href={user.cv} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <FileText className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
