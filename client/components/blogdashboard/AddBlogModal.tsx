"use client";
import { BACKENDURL } from "@/data/urls";
import React, { useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { getJWT, getUserID } from "@/data/cookies/getCookies";
import { CldUploadButton } from "next-cloudinary";
import { UploadCloud, Pencil } from "lucide-react";
import ArticleEditor from "./ArticleEditor";
import { uploadImageToCloud } from "@/utils/ImageUploadService";
import Todo from "./article/NotePicker";
import Notes from "./article/Notes";
import HtmlContent from "./BlogComp/HtmlContent";



 // Import TextEditor component


interface BlogFormProps {
  onClose: () => void;
  fetchDataAll: () => void;
}

interface FormData {
  userid: number;
  headline: string;
  designation: string;
  current_institution: string;
  article: string;
  photos: string[];
  blogtype: string;
  approval_status: boolean;
}

const BlogModal: React.FC<BlogFormProps> = ({ onClose, fetchDataAll }) => {
    const [content, setContent] = useState('<p>Initial content</p>');
    const userids = Number(getUserID()) || 2;
  const [formData, setFormData] = useState<FormData>({
    userid: userids,
    headline: "",
    designation: "",
    current_institution: "",
    article: "",
    photos: [],
    blogtype: "",
    approval_status: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    console.log(formData);
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields = ["headline", "designation", "current_institution", "article", "blogtype"];
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData] || formData[field as keyof FormData].toString().trim() === "") {
        alert(`The field "${field}" is required.`);
        return false;
      }
    }
    if (formData.photos.length === 0) {
      alert("At least one photo is required.");
      return false;
    }
    return true;
  };


  const removePhoto = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      photos: prevData.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {

    if (!validateForm()) {
      return; // Exit if validation fails
    }

    
    try {
      console.log("All Data", formData);
  
      const response = await axios.post(`${BACKENDURL}blog/create`, formData, {
        headers: {
          Authorization: `Bearer ${getJWT()}`,
        },
      });
  
      // Check for successful response
      if (response.status === 201 || response.status === 200) {
        onClose();
        fetchDataAll();
        
        // window.location.reload();
      }
    } catch (error) {
      // Handle error response
      console.error("Error creating blog:", error);
      
    }
  };
  

  const handleArticleChange = (newContent: string) => {
    console.log("Article Change", newContent);
    setFormData((prev) => ({
      ...prev,
      article: newContent,
    }));
  };

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
      <div className="bg-black text-white p-8 rounded-lg w-full lg:max-w-2xl  xl:max-w-4xl 2xl:max-w-5xl ">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4">Add Blog</h2>
          <button
            onClick={onClose}
            className="bg-gray-200 p-1 m-2 text-gray-700 w-5 h-5 flex justify-center items-center rounded-full"
          >
            X
          </button>
        </div>

        <div className="space-y-4 h-[70vh] overflow-y-scroll px-2">
          <input
            type="text"
            placeholder="Headline"
            value={formData.headline}
            onChange={(e) => handleChange(e, "headline")}
            className="w-full p-2 rounded bg-gray-900 border"
          />
          <input
            type="text"
            placeholder="Designation"
            value={formData.designation}
            onChange={(e) => handleChange(e, "designation")}
            className="w-full p-2 rounded bg-gray-900 border"
          />
          <input
            type="text"
            placeholder="Current Institution"
            value={formData.current_institution}
            onChange={(e) => handleChange(e, "current_institution")}
            className="w-full p-2 rounded bg-gray-900 border"
          />
                    <input
            type="text"
            placeholder="Blog Type"
            value={formData.blogtype}
            onChange={(e) => handleChange(e, "blogtype")}
            className="w-full p-2 rounded bg-gray-900 border"
          />

          <div className="text-lg font-semibold mt-3">Article</div>
          <ArticleEditor content={formData.article} onContentChange={handleArticleChange} />
          {/* <HtmlContent content={formData.article} />  // Privew*/}
          {/* <Todo/> */}
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
<div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className=" bg-red-600 text-white rounded px-4 py-2 mt-4"
          >
            Submit
          </button>
          </div>
        </div>
      </div>
     
    </div>
  );
};

export default BlogModal;
