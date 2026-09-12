import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Github,
  Linkedin,
  Facebook,
  Globe,
  MapPin,
  Book,
  School,
  Phone,
  Mail,
  FileText,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "@/data/types";
import { APIENDPOINTS } from "@/data/urls";
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
  const [userDetails, setUserDetails] = React.useState<UserProfile | null>(
    null
  );
   const [showSendCred, setShowSendCred] = React.useState(false);
  const [sendEmail, setSendEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

    React.useEffect(() => {
    if (userDetails) {
      setSendEmail(userDetails.email || "");
    }
  }, [userDetails]);

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${APIENDPOINTS.users.getUserbyID}/${userId}`
        );
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open && userId) {
      fetchUserDetails();
    }
  }, [userId, open]);

  if (!open || !userDetails) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <div className="m-5 p-2 rounded-md w-full">
            {!showSendCred ? (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setShowSendCred(true)}
              >
                Send Credentials
              </button>
            ) : (
              <form
                className=" flex gap-5 w-full"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSending(true);
                  try {
                    await axios.post(
                      `${APIENDPOINTS.auth.sendUserCreds}`,
                      {
                        regno: userDetails.regno,
                        nemail: sendEmail,
                      }
                    );
                    toast({
                      title: "Success",
                      description: "Credentials sent successfully!",
                    });
                    setShowSendCred(false);
                  } catch (err) {
                    toast({
                      title: "Error",
                      description: "Failed to send credentials.",
                      variant: "destructive",
                    });
                  } finally {
                    setSending(false);
                  }
                }}
              >
                <input
                  type="email"
                  className="border px-2 py-1 rounded min-w-[400px]"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowSendCred(false)}
                  disabled={sending}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={userDetails.profile_picture}
                alt={userDetails.fullname}
              />
              <AvatarFallback>
                {userDetails.fullname
                  ? userDetails.fullname.substring(0, 2)
                  : "NA"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{userDetails.fullname}</h2>
              <div className="flex items-center gap-2">
                <Badge>{userDetails.role}</Badge>
                {userDetails.is_alumni && (
                  <Badge variant="secondary">Alumni</Badge>
                )}
                <Badge variant="outline">{userDetails.blood_group}</Badge>
              </div>
              <div className="flex gap-2">
                {userDetails.github_id && (
                  <a
                    href={userDetails.github_id}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="icon">
                      <Github className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {userDetails.linkedin_id && (
                  <a
                    href={userDetails.linkedin_id}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="icon">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {userDetails.facebook_id && (
                  <a
                    href={userDetails.facebook_id}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="icon">
                      <Facebook className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {userDetails.cv && (
                  <a
                    href={userDetails.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{userDetails.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{userDetails.whatsapp || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{userDetails.hometown}</span>
            </div>
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-muted-foreground" />
              <span>Session: {userDetails.session}</span>
            </div>
          </div>

          <Separator />

          {/* Education */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Education</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">College:</span>
                <span>{userDetails.college}</span>
              </div>
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">School:</span>
                <span>{userDetails.school}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          {userDetails.skills && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {userDetails.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {userDetails.projects && userDetails.projects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Projects</h3>
              <div className="space-y-2">
                {userDetails.projects.map((project, index) => (
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
          {userDetails.experience && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Experience</h3>
              <p className="text-muted-foreground">{userDetails.experience}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
