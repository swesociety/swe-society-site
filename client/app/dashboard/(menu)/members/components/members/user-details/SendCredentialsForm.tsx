import { useToast } from '@/components/ui/use-toast';
import { sendUserCredentials } from '../../../actions';
import { useState, useTransition } from 'react';

interface SendCredentialsFormProps {
  regno: string;
  defaultEmail: string;
  onCancel: () => void;
}

export function SendCredentialsForm({
  regno,
  defaultEmail,
  onCancel,
}: SendCredentialsFormProps) {
  const [sendEmail, setSendEmail] = useState(defaultEmail);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const response = await sendUserCredentials(regno, sendEmail);
      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Success',
          description: 'Credentials sent successfully!',
        });
        onCancel();
      } else {
        toast({
          title: 'Error',
          description: (response.data as any)?.message || 'Failed to send credentials.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <form className="flex gap-5 w-full" onSubmit={handleSubmit}>
      <input
        type="email"
        className="border px-2 py-1 rounded min-w-[400px]"
        value={sendEmail}
        onChange={(e) => setSendEmail(e.target.value)}
        required
        disabled={isPending}
      />
      <button
        type="submit"
        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPending}
      >
        {isPending ? 'Sending...' : 'Send'}
      </button>
      <button
        type="button"
        className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        onClick={onCancel}
        disabled={isPending}
      >
        Cancel
      </button>
    </form>
  );
}
