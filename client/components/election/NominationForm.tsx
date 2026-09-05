"use client";
import { getJWT, getUserID } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { encryptObject, reqSalt_keys } from "@/utils/encrypt_req";
import { uploadImageToCloud } from "@/utils/ImageUploadService";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useToast } from "../ui/use-toast";
interface PostResponse {
  committeepostid: number;
  post_name: string;
}
interface MappedPost {
  value: number;
  label: string;
}

interface CandidateFormData {
  marka_name: string;
  slogan: string;
  logo: File | null;
  committeepostid: number;
}

const NominationForm: React.FC<{ electionID: number }> = ({ electionID }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [postList, setPostList] = useState<MappedPost[]>([]);
  const [formData, setFormData] = useState<CandidateFormData>({
    marka_name: "",
    slogan: "",
    logo: null,
    committeepostid: 0,
  });
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(APIENDPOINTS.election.getAllPosition);
        const posts: PostResponse[] = response.data;
        const mappedPosts = posts.map((post) => ({
          value: post.committeepostid,
          label: post.post_name,
        }));
        setPostList(mappedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, logo: e.target.files[0] });
    }
  };

  const handleSelectChange = (selectedOption: any) => {
    setFormData({
      ...formData,
      committeepostid: selectedOption ? selectedOption.value : 0,
    });
  };

  const validateform = () => {
    if (formData.marka_name === "") {
      toast({
        title: "Marka name is required.",
        duration: 3000,
        variant: "destructive",
      });
      return false;
    }
    if (formData.slogan === "") {
      toast({
        title: "Slogan is required.",
        duration: 3000,
        variant: "destructive",
      });
      return false;
    }
    if (formData.committeepostid === 0) {
      toast({
        title: "Post is required.",
        duration: 3000,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setDisabled(true);
    e.preventDefault();

    if (!validateform()) return;

    try {
      let logoUrl: string | null = null;

      // 1. Upload logo image if exists
      if (formData.logo) {
        logoUrl = await uploadImageToCloud(formData.logo);
      } else {
        toast({
          title: "Logo missing",
          description: "Please upload a logo to proceed.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // 2.  Prepare candidate info
      const candidate_info = {
        electionid: electionID ? electionID : 0,
        userId: getUserID() ? Number(getUserID()) : 0,
        marka_name: formData.marka_name,
        slogan: formData.slogan,
        logo_url: logoUrl,
        committeepostid: formData.committeepostid,
      };

      const encryptedData = encryptObject(
        candidate_info,
        reqSalt_keys.candidate.createcandidate
      );

      // 3.  Submit to backend
      const res = await axios.post(
        APIENDPOINTS.candidate.createNomination,
        encryptedData,
        { headers: { Authorization: `Bearer ${getJWT()}` } }
      );

      // 4.  Handle responses
      if (res.status === 201) {
        toast({
          title: "Success",
          description: "Your nomination has been submitted.",
          duration: 3000,
        });
        router.push("/dashboard/profile");
      } else if (res.status === 409) {
        toast({
          title: "Already registered",
          description:
            res.data.message || "You have already submitted a nomination.",
          variant: "destructive",
          duration: 3000,
        });
      } else if (res.status === 400) {
        toast({
          title: "Invalid Input",
          description: res.data.message || "Invalid user or election info.",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: "Unexpected Error",
          description: "Something went wrong. Try again later.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Failed to submit nomination.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setDisabled(false);
      router.push("/dashboard/profile");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50  w-full h-full">
      <div className="bg-black text-white p-8 rounded-lg w-1/2  max-w-6xl">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4">
            SWE Society {electionID}
            <sup>th</sup> Election nomination form
          </h2>
          <button
            onClick={() => {}}
            className="bg-gray-200 p-1 w-5 h-5 flex justify-center items-center rounded-full text-black"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          <div
            className="p-2 m-2
            gap-2 
           bg-gray-700
            rounded-md space-y-2"
          >
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

          <div
            className="p-2 m-2
            gap-2 
           bg-gray-700
            rounded-md space-y-2"
          >
            <label className="text-sm font-medium">Slogan</label>
            <textarea
              name="slogan"
              value={formData.slogan}
              onChange={handleInputChange}
              className="p-2 text-lg border rounded w-full text-gray-800 bg-gray-100 leading-tight focus:outline-none"
            />
          </div>

          <div
            className="p-2 m-2
            gap-2 
           bg-gray-700
            rounded-md space-y-2"
          >
            <label className="text-sm font-medium">Upload Logo</label>
            {formData.logo && (
              <Image
                className="p-5"
                src={URL.createObjectURL(formData.logo)}
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
            />
          </div>

          <div
            className="p-2 m-2
            gap-2 
           bg-gray-700
            rounded-md space-y-2"
          >
            <label className="text-sm font-medium">Select Position</label>
            <Select
              options={postList}
              onChange={handleSelectChange}
              className="border rounded w-full text-gray-800 bg-gray-100 leading-tight focus:outline-none"
            />
          </div>

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
        </form>
      </div>
    </div>
  );
};

export default NominationForm;
