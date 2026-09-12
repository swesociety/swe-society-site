import { getJWT } from '@/data/cookies/getCookies';
import { uploadImageToCloud } from '@/utils/ImageUploadService';
import Image from 'next/image';
import { useEffect, useState, useTransition } from 'react';
import Select from 'react-select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../../components/ui/dialog';
import { toast } from '../../../../../components/ui/use-toast';
import { createManualNomination, getAllPositions, getUsers } from '../actions';
import type { NominationMember, MappedPost } from '../types';

interface ManualNominationProps {
  electionId: number;
  users?: any[];
  posts?: any[];
}

function ManualNomination({
  electionId,
  users: usersProp,
  posts: postsProp,
}: ManualNominationProps) {
  const [members, setMembers] = useState<NominationMember[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [postList, setPostList] = useState<MappedPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (usersProp && usersProp.length > 0 && postsProp && postsProp.length > 0) {
      setMembers(usersProp);
      setPostList(
        postsProp.map((post: any) => ({
          value: post.committeepostid,
          label: post.post_name,
        })),
      );
      return;
    }

    const fetchMembers = async () => {
      try {
        const [usersData, postsData] = await Promise.all([
          getUsers(),
          getAllPositions(),
        ]);

        setMembers(usersData as NominationMember[]);
        setPostList(
          postsData.map((post) => ({
            value: post.committeepostid,
            label: post.post_name,
          })),
        );
      } catch (error) {
        console.error('Error fetching members or posts:', error);
        toast({
          title: 'Error fetching data',
          description: 'Could not load necessary data for the form.',
          variant: 'destructive',
          duration: 3000,
        });
      }
    };

    fetchMembers();
  }, [usersProp, postsProp]);

  const [formData, setFormData] = useState({
    electionId: electionId,
    userid: 0,
    marka_name: '',
    slogan: '',
    logo_url: '',
    committeepostid: -1,
    request_approval_status: false,
  });

  // Function to reset form state
  const clearform = () => {
    setFormData({
      electionId: electionId,
      userid: 0,
      marka_name: '',
      slogan: '',
      logo_url: '',
      committeepostid: -1,
      request_approval_status: false,
    });
    setFile(null);
  };

  // Handler for dialog open/close state changes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      clearform();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSelectChange = (selectedOption: any) => {
    setFormData({
      ...formData,
      committeepostid: selectedOption ? selectedOption.value : -1,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Frontend validation
    if (
      formData.marka_name.trim() === '' ||
      formData.slogan.trim() === '' ||
      formData.userid === 0 ||
      formData.committeepostid === -1 ||
      file === null
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields and upload a logo.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    startTransition(async () => {
      try {
        // Upload image first, then call server action
        const logourl = await uploadImageToCloud(file!);

        const response = await createManualNomination(
          {
            electionid: formData.electionId,
            userId: formData.userid,
            marka_name: formData.marka_name,
            slogan: formData.slogan,
            logo_url: logourl,
            committeepostid: formData.committeepostid,
            request_approval_status: formData.request_approval_status,
          },
          getJWT() || '',
        );

        if (response.status === 201 || response.status === 200) {
          toast({
            title: 'Success',
            description: 'Nomination has been submitted successfully.',
            duration: 3000,
          });
          setIsDialogOpen(false); // clearform called by handleDialogOpenChange
        } else if (response.status === 409) {
          toast({
            title: 'Already registered',
            description:
              (response.data as any)?.message ||
              'A nomination for this user already exists in this election.',
            variant: 'destructive',
            duration: 3000,
          });
        } else if (response.status === 400) {
          toast({
            title: 'Invalid Input',
            description:
              (response.data as any)?.message ||
              'Invalid user or election information. Please check your inputs.',
            variant: 'destructive',
            duration: 3000,
          });
        } else {
          toast({
            title: 'Submission Failed',
            description:
              (response.data as any)?.message ||
              'An unexpected error occurred. Please try again.',
            variant: 'destructive',
            duration: 3000,
          });
        }
      } catch (error: any) {
        console.error('Error submitting nomination:', error);
        toast({
          title: 'Submission Failed',
          description:
            'Failed to submit nomination. Please check your internet connection and try again.',
          variant: 'destructive',
          duration: 3000,
        });
      }
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <button className="bg-red-700 rounded-lg px-4 mr-2">
          Manual Nomination
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manual Nomination Submission</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="grid gap-4 overflow-y-auto pr-2 flex-grow min-h-0">
            <div className="w-full gap-2 grid grid-cols-1 md:grid-cols-2 bg-gray-700 rounded-md">
              <div className="space-y-2 w-full p-2">
                <label className="text-sm font-medium">Select User</label>
                <Select
                  options={members.map((member) => ({
                    value: member.userid,
                    label: `${member.fullname} (${member.regno})`,
                  }))}
                  onChange={(selectedOption) =>
                    setFormData({
                      ...formData,
                      userid: selectedOption ? selectedOption.value : 0,
                    })
                  }
                  value={
                    members.find((member) => member.userid === formData.userid)
                      ? {
                          value: formData.userid,
                          label:
                            members.find(
                              (member) => member.userid === formData.userid,
                            )?.fullname +
                            ` (${
                              members.find(
                                (member) => member.userid === formData.userid,
                              )?.regno
                            })`,
                        }
                      : null
                  }
                  className="w-full border rounded text-gray-800 bg-gray-100 leading-tight focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="p-2 gap-2 bg-gray-700 rounded-md space-y-2">
              <label className="text-sm font-medium">Marka Name</label>
              <input
                type="text"
                name="marka_name"
                value={formData.marka_name}
                onChange={handleInputChange}
                className="border p-2 text-lg rounded w-full text-gray-800 bg-gray-100 leading-tight focus:outline-none"
                required
              />
            </div>
            <div className="p-2 gap-2 bg-gray-700 rounded-md space-y-2">
              <label className="text-sm font-medium">Slogan</label>
              <textarea
                name="slogan"
                value={formData.slogan}
                onChange={handleInputChange}
                className="p-2 text-lg border rounded w-full text-gray-800 bg-gray-100 leading-tight focus:outline-none"
                required
              />
            </div>
            <div className="p-2 gap-2 bg-gray-700 rounded-md space-y-2">
              <label className="text-sm font-medium">Upload Logo</label>
              {file !== null && (
                <Image
                  className="p-5"
                  src={URL.createObjectURL(file)}
                  alt="Logo"
                  width={100}
                  height={100}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border rounded w-full text-gray-800 bg-gray-100 leading-tight focus:outline-none"
                required
              />
            </div>
            <div className="p-2 gap-2 bg-gray-700 rounded-md space-y-2">
              <label className="text-sm font-medium">Select Position</label>
              <Select
                options={postList}
                onChange={handleSelectChange}
                value={
                  postList.find(
                    (post) => post.value === formData.committeepostid,
                  ) || null
                }
                className="border rounded w-full text-gray-800 bg-gray-100 leading-tight focus:outline-none"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex w-full justify-end mt-4">
              <button
                type="submit"
                disabled={isPending}
                className={`bg-red-600 text-white rounded px-4 py-2 ${
                  isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ManualNomination;
