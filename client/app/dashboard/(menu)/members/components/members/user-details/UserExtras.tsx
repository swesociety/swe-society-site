import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/data/types';
import { ExternalLink, Globe } from 'lucide-react';

interface UserExtrasProps {
  user: UserProfile;
}

export function UserExtras({ user }: UserExtrasProps) {
  return (
    <>
      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {user.projects && user.projects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Projects</h3>
          <div className="space-y-2">
            {user.projects.map((project, index) => (
              <a
                key={index}
                href={project}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Globe className="h-4 w-4" />
                {project}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {user.experience && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Experience</h3>
          <p className="text-muted-foreground">{user.experience}</p>
        </div>
      )}
    </>
  );
}
