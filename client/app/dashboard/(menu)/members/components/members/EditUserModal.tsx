'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/data/types';
import { getJWT } from '@/data/cookies/getCookies';
import { getUserById, updateUser } from '../../actions';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
  onSuccess?: () => void;
}

type EditableFields = Pick<
  UserProfile,
  | 'fullname'
  | 'email'
  | 'session'
  | 'phone_number'
  | 'bio'
  | 'linkedin_id'
  | 'github_id'
  | 'facebook_id'
  | 'whatsapp'
  | 'blood_group'
  | 'school'
  | 'college'
  | 'hometown'
  | 'stop_stalk_id'
>;

const emptyForm: EditableFields = {
  fullname: '',
  email: '',
  session: '',
  phone_number: '',
  bio: '',
  linkedin_id: '',
  github_id: '',
  facebook_id: '',
  whatsapp: '',
  blood_group: '',
  school: '',
  college: '',
  hometown: '',
  stop_stalk_id: '',
};

interface FieldConfig {
  key: keyof EditableFields;
  label: string;
  type?: string;
  placeholder?: string;
}

const fields: FieldConfig[] = [
  { key: 'fullname', label: 'Full Name', placeholder: 'Full name' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'Email address' },
  { key: 'session', label: 'Session', placeholder: 'e.g. 2021-22' },
  { key: 'phone_number', label: 'Phone Number', placeholder: 'Phone number' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'WhatsApp number' },
  { key: 'blood_group', label: 'Blood Group', placeholder: 'e.g. A+' },
  { key: 'hometown', label: 'Hometown', placeholder: 'Hometown' },
  { key: 'school', label: 'School', placeholder: 'School name' },
  { key: 'college', label: 'College', placeholder: 'College name' },
  { key: 'github_id', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/...' },
  { key: 'linkedin_id', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/...' },
  { key: 'facebook_id', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/...' },
  { key: 'stop_stalk_id', label: 'StopStalk ID', placeholder: 'StopStalk username' },
  { key: 'bio', label: 'Bio', placeholder: 'Short bio' },
];

export function EditUserModal({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: EditUserModalProps) {
  const [form, setForm] = useState<EditableFields>(emptyForm);
  const [isFetching, startFetchTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const { toast } = useToast();

  // Load user data when dialog opens
  useEffect(() => {
    if (!open || !userId) return;
    setForm(emptyForm);

    startFetchTransition(async () => {
      const response = await getUserById(userId);
      if (response.status === 200) {
        const user = response.data as UserProfile;
        setForm({
          fullname: user.fullname ?? '',
          email: user.email ?? '',
          session: user.session ?? '',
          phone_number: user.phone_number ?? '',
          bio: user.bio ?? '',
          linkedin_id: user.linkedin_id ?? '',
          github_id: user.github_id ?? '',
          facebook_id: user.facebook_id ?? '',
          whatsapp: user.whatsapp ?? '',
          blood_group: user.blood_group ?? '',
          school: user.school ?? '',
          college: user.college ?? '',
          hometown: user.hometown ?? '',
          stop_stalk_id: user.stop_stalk_id ?? '',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load user data.',
          variant: 'destructive',
        });
        onOpenChange(false);
      }
    });
  }, [open, userId]);

  const handleChange = (key: keyof EditableFields, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startSaveTransition(async () => {
      if (!userId) return;
      const response = await updateUser(userId, form, getJWT() || '');
      if (response.status === 200 || response.status === 201) {
        toast({ title: 'Success', description: 'User updated successfully.' });
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast({
          title: 'Update Failed',
          description:
            (response.data as any)?.message || 'Could not update user.',
          variant: 'destructive',
        });
      }
    });
  };

  const isPending = isFetching || isSaving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading user data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(({ key, label, type = 'text', placeholder }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-medium">{label}</label>
                  {key === 'bio' ? (
                    <textarea
                      className="border rounded px-3 py-2 text-sm bg-background resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                      value={form[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      disabled={isPending}
                    />
                  ) : (
                    <input
                      type={type}
                      className="border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      value={form[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      disabled={isPending}
                    />
                  )}
                </div>
              ))}
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded border text-sm hover:bg-muted disabled:opacity-50"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
