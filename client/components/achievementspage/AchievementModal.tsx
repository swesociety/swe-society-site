"use client";
import { BACKENDURL } from "@/data/urls";
import React, { useEffect, useState } from "react";
import Select, { MultiValue, ActionMeta } from "react-select";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { getJWT } from "@/data/cookies/getCookies";
import { CldUploadButton } from "next-cloudinary";
import {
  CircleX,
  LoaderIcon,
  Pencil,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { DatePicker } from "../commons/DatePicker";
import { useToast } from "../ui/use-toast";
import { uploadImageToCloud } from "@/utils/ImageUploadService";

interface AchievementFormProps {
  onClose: () => void;
  onAchievementAdded: () => void

}

interface UserResponse {
  userid: number;
  regno: string;
  // other properties if needed
}

interface MappedUser {
  id: number;
  value: number;
  label: string;
}

interface FormData {
  teamname: string;
  mentor: string;
  teammembers: number[];
  eventname: string;
  segment: string;
  rank: string;
  photos: string[];
  task: string;
  solution: string;
  techstack: string;
  resources: string;
  others: { othermember: string; other_member_institute: string }[];
  startdate: string;
  enddate: string;
  organizer: string;
  venu: string;
}

const AchievementModal: React.FC<AchievementFormProps> = ({ onClose, onAchievementAdded }) => {
  const [userList, setUserList] = useState<MappedUser[]>([]);
  const [formData, setFormData] = useState<FormData>({
    teamname: "",
    mentor: "",
    teammembers: [] as number[],
    eventname: "",
    segment: "",
    rank: "",
    photos: [] as string [],
    task: "",
    solution: "",
    techstack: "",
    resources: "",
    others: [] as { othermember: string; other_member_institute: string }[],
    startdate: "",
    enddate: "",
    organizer: "",
    venu: "",
  });
  const { toast } = useToast();
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleOthersChange = (index: number, field: string, value: string) => {
    const updatedOthers = [...formData.others];
    updatedOthers[index][field as keyof typeof updatedOthers[0]] = value;
    setFormData((prev) => ({
      ...prev,
      others: updatedOthers,
    }));
  };

  const addOthersField = () => {
    setFormData((prev) => ({
      ...prev,
      others: [...prev.others, { othermember: "", other_member_institute: "" }],
    }));
  };

  // const notify = () => toast('Your achivement to added for review.');
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    const requiredFields = [
      'teamname', 'eventname', 'segment', 'rank', 'photos', 'startdate', 'organizer'
    ];
  
    const missingFields = requiredFields.filter((field) => {
      return !formData[field as keyof FormData] || 
             (Array.isArray(formData[field as keyof FormData]) && formData[field as keyof FormData].length === 0);
    });
  
    if (missingFields.length > 0) {
      // Show an alert or error message if any required fields are missing
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    const requestBody = {
      teamname: formData.teamname,
      mentor: formData.mentor,
      teammembers: formData.teammembers,
      others: formData.others.map((other) => ({
        othermember: other.othermember,
        other_member_institute: other.other_member_institute,
      })),
      eventname: formData.eventname,
      segment: formData.segment,
      organizer: formData.organizer,
      venue: formData.venu,
      startdate: formData.startdate,
      enddate: formData.startdate,
      rank: formData.rank,
      rankarea: "National", // This value could be dynamic if needed
      task: formData.task,
      solution: formData.solution,
      techstack: formData.techstack,
      resources: formData.resources,
      photos: formData.photos,
      approval_status: false, // Assuming this is true by default, you can make it dynamic if needed
    };
  

    const response = await axios.post(`${BACKENDURL}achievement/post/fullachievement`, requestBody, {
      headers: {
        Authorization: `Bearer ${getJWT()}`,
      },
    });
    if(response.status === 201){
      toast({
        title: "Achievement Updated  Successfully",
        duration: 3000,
      });
      onAchievementAdded();
      // notify();
    
     
      // window.location.reload();
    }
    
  };

  const handleSelectChange = (selectedOptions: MultiValue<MappedUser>) => {
    const selectedIds = selectedOptions.map(option => option.id);
    setFormData((prev) => ({
      ...prev,
      teammembers: selectedIds,
    }));
    console.log(formData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKENDURL}users/`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        
        const data: UserResponse[] = await response.json();

        // Map the response to the required structure
        const mappedData: MappedUser[] = data.map((user) => ({
          id: user.userid,
          value: user.userid,
          label: user.regno,
        }));

        setUserList(mappedData);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, []);


  const removePhoto = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      photos: prevData.photos.filter((_, i) => i !== index),
    }));
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({ ...prev, startdate: date }));
  };
  
  useEffect(()=>{
    
    console.log(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    console.log(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
    console.log(process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET);
    console.log(process.env.NEXT_PUBLIC_IMG_UPLOAD_PRESET);
    console.log(process.env.NEXT_PUBLIC_Assets_UPLOAD_PRESET);
  },[])

  const handleFileUpload = async (file: File) => {
    try {
      const uploadedURL = await uploadImageToCloud(file);
      setFormData((prevData) => ({
        ...prevData,
        photos: [...prevData.photos, uploadedURL],
      }));
      console.log("Image uploaded successfully:", uploadedURL);
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };






 


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
     
      <div className="bg-black text-white p-8 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-4">Add Achievement</h2>
        <button 
        onClick={()=>{onClose()}}
        className="bg-white p-1 m-2 text-black w-5 h-5 flex justify-center items-center rounded-full">X</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 h-[70vh] overflow-y-scroll px-2">
       
          <input
            type="text"
            placeholder="Team Name"
            value={formData.teamname}
            onChange={(e) => handleChange(e, "teamname")}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Mentor"
            value={formData.mentor}
            onChange={(e) => handleChange(e, "mentor")}
            className="w-full p-2 rounded bg-gray-700"
          />
           <Select
            name="Team Members"
            isMulti
            options={userList}
            className=" border rounded w-full   text-gray-800 bg-gray-700 leading-tight focus:outline-none"
            onChange={handleSelectChange}
          />
          <div className="w-full text-sm flex justify-end">
            <button type="button" onClick={addOthersField} className="underline text-red-400">Add member from another department / institution</button>
          </div>

          {formData.others.map((other, index) => (
            <div key={index} id="others" className=" grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Other Member"
                value={other.othermember}
                onChange={(e) => handleOthersChange(index, "othermember", e.target.value)}
                className="w-full p-2 rounded bg-gray-700"
              />
              <input
                type="text"
                placeholder="Other Dept, Institute"
                value={other.other_member_institute}
                onChange={(e) => handleOthersChange(index, "other_member_institute", e.target.value)}
                className="w-full p-2 rounded bg-gray-700"
              />
            </div>
          ))}
          <input
            type="text"
            placeholder="Event Name"
            value={formData.eventname}
            onChange={(e) => handleChange(e, "eventname")}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Segment"
            value={formData.segment}
            onChange={(e) => handleChange(e, "segment")}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Rank"
            value={formData.rank}
            onChange={(e) => handleChange(e, "rank")}
            className="w-full p-2 rounded bg-gray-700"
          />
          <textarea
            placeholder="Task"
            value={formData.task}
            onChange={(e) => handleChange(e, "task")}
            className="w-full p-2 rounded bg-gray-700"
          />
          <textarea
            placeholder="Solution"
            value={formData.solution}
            onChange={(e) => handleChange(e, "solution")}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Tech Stack"
            value={formData.techstack}
            onChange={(e) => handleChange(e, "techstack")}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Resources"
            value={formData.resources}
            onChange={(e) => handleChange(e, "resources")}
            className="w-full p-2 rounded bg-gray-700"
          />
          <div className=" space-x-2">
          <label className="text-sm font-medium">Competition Date</label>
          <DatePicker onDateChange={handleDateChange} />
          </div>
       
          <input
            type="text"
            placeholder="Organizer"
            value={formData.organizer}
            onChange={(e) => handleChange(e, "organizer")}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Venue"
            value={formData.venu}
            onChange={(e) => handleChange(e, "venu")}
            className="w-full p-2 rounded bg-gray-700"
          />
           <div className="space-y-4">
          <label className="block text-sm font-medium">Upload Achievement Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 bg-gray-700 rounded border border-gray-600 cursor-pointer"
          />
        </div>
             {formData.photos && formData.photos.length > 0 && (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">Uploaded Photos</h3>
    <div className="grid grid-cols-1 gap-4">
    {formData.photos && formData.photos.length > 0 && (
          <div className="space-y-2">
           
            <div className="grid grid-cols-4 gap-4">
              {formData.photos.map((photoUrl, index) => (
                <div key={index} className="relative flex flex-col items-center">
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 left-2 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                    aria-label="Remove photo"
                  >
                    &times;
                  </button>
                  <img src={photoUrl} alt={`Uploaded photo ${index + 1}`} className="w-full h-32 object-cover rounded" />
                  <a href={photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline mt-2">
                    View Full Image
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  </div>
)}
     
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-700 rounded px-4 py-2"
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-green-600 rounded px-4 py-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AchievementModal;
