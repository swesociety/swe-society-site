import { getJWT } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { encryptObject, reqSalt_keys } from "@/utils/encrypt_req";
import { uploadImageToCloud } from "@/utils/ImageUploadService"; // Assuming this returns a Promise<string>
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import Select from "react-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "../ui/use-toast";

interface Member {
  userid: number;
  year: string;
  fullname: string;
  profile_picture: string | null;
  email: string;
  regno: string;
  session: string;
  committee_post: string;
}
interface PostResponse {
  committeepostid: number;
  post_name: string;
}
interface MappedPost {
  value: number;
  label: string;
}
interface ManualNominationProps {
  electionId: number;
}

function ManualNomination({ electionId }: ManualNominationProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [postList, setPostList] = useState<MappedPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog open/close

  const fetchMembers = async () => {
    try {
      const usersRes = await axios.get(`${APIENDPOINTS.users.getAllUsers}`);
      setMembers(usersRes.data);

      const postsRes = await axios.get(APIENDPOINTS.election.getAllPosition);
      const posts: PostResponse[] = postsRes.data;
      const mappedPosts = posts.map((post) => ({
        value: post.committeepostid,
        label: post.post_name,
      }));
      setPostList(mappedPosts);
    } catch (error) {
      console.error("Error fetching members or posts:", error);
      toast({
        title: "Error fetching data",
        description: "Could not load necessary data for the form.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchMembers();
    // No need to clearform() here, as onOpenChange will handle it when dialog opens
  }, []); // Empty dependency array means this runs once on mount

  const [formData, setFormData] = useState({
    electionId: electionId,
    userid: 0,
    marka_name: "",
    slogan: "",
    logo_url: "", // This will be set after image upload
    committeepostid: -1,
    request_approval_status: false, // Changed to boolean
  });

  // Function to reset form state
  const clearform = () => {
    setDisabled(false);
    setFormData({
      electionId: electionId,
      userid: 0,
      marka_name: "",
      slogan: "",
      logo_url: "",
      committeepostid: -1,
      request_approval_status: false,
    });
    setFile(null);
  };

  // Handler for dialog open/close state changes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // If the dialog is closing
      clearform();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null); // Clear file if nothing is selected
    }
  };

  const handleSelectChange = (selectedOption: any) => {
    setFormData({
      ...formData,
      committeepostid: selectedOption ? selectedOption.value : -1, // Set to -1 if no option is selected
    });
  };

  // Changed to handle form onSubmit event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    setDisabled(true);

    console.log("Form Data before submission:", formData);

    // Frontend validation
    if (
      formData.marka_name.trim() === "" ||
      formData.slogan.trim() === "" ||
      formData.userid === 0 ||
      formData.committeepostid === -1 ||
      file === null
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and upload a logo.",
        variant: "destructive",
        duration: 3000,
      });
      setDisabled(false);
      return;
    }

    try {
      // Await the image upload
      const logourl = await uploadImageToCloud(file!);

      const final_formData = {
        electionid: formData.electionId,
        userId: formData.userid,
        marka_name: formData.marka_name,
        slogan: formData.slogan,
        logo_url: logourl, // Use the awaited URL
        committeepostid: formData.committeepostid,
        request_approval_status: formData.request_approval_status, // Use the boolean value
      };

      const encryptedData = encryptObject(
        final_formData,
        reqSalt_keys.candidate.createcandidate
      );

      const res = await axios.post(
        APIENDPOINTS.candidate.createNomination,
        encryptedData,
        { headers: { Authorization: `Bearer ${getJWT()}` } }
      );

      // Only 2xx status codes reach here for a successful response
      if (res.status === 201) {
        toast({
          title: "Success",
          description: "Your nomination has been submitted.",
          duration: 3000,
        });
        // clearform is now called by handleDialogOpenChange when dialog closes
        setIsDialogOpen(false); // Close dialog on success
      }
    } catch (error: any) {
      // Type 'error' as 'any' or 'AxiosError' for better error handling
      console.error("Error submitting nomination:", error);

      if (axios.isAxiosError(error) && error.response) {
        // Handle specific API error responses
        if (error.response.status === 409) {
          toast({
            title: "Already registered",
            description:
              error.response.data.message ||
              "You have already submitted a nomination for this election.",
            variant: "destructive",
            duration: 3000,
          });
        } else if (error.response.status === 400) {
          toast({
            title: "Invalid Input",
            description:
              error.response.data.message ||
              "Invalid user or election information. Please check your inputs.",
            variant: "destructive",
            duration: 3000,
          });
        } else {
          toast({
            title: "Submission Failed",
            description:
              error.response.data.message ||
              "An unexpected error occurred. Please try again.",
            variant: "destructive",
            duration: 3000,
          });
        }
      } else {
        // Handle network errors or other unexpected errors
        toast({
          title: "Submission Failed",
          description:
            "Failed to submit nomination. Please check your internet connection and try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setDisabled(false); // Re-enable button regardless of success or failure
    }
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
          {/* Added flex-shrink-0 to prevent header/footer from shrinking unnecessarily */}
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
                              (member) => member.userid === formData.userid
                            )?.fullname +
                            ` (${
                              members.find(
                                (member) => member.userid === formData.userid
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
                    (post) => post.value === formData.committeepostid
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
                disabled={disabled}
                className={`bg-red-600 text-white rounded px-4 py-2 ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Submit
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ManualNomination;
