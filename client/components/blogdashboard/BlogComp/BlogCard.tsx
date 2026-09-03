"use client";
import { useToast } from "@/components/ui/use-toast";
import { getJWT } from "@/data/cookies/getCookies";
import { BACKENDURL } from "@/data/urls";
import axios from "axios";
import React, { useState } from "react";
import { MdDelete, MdModeEditOutline } from "react-icons/md";



interface CardProps {
    blogid: number;
  label: string;
  title: string;
  description: string;
  author: string | null;
  timeToRead?: string;
  image: string | null;
  setBlogId: React.Dispatch<React.SetStateAction<number | null>>;
  setOpenDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFullBlog: React.Dispatch<React.SetStateAction<boolean>>;
}

const Card: React.FC<CardProps> = ({
    blogid,
  label,
  title,
  description,
  author,
  timeToRead = "3 min read",
  image,
  setBlogId,
  setOpenDeleteModal,
  setOpenEditModal,
  setShowFullBlog
}) => {

  const calculateTimeToRead = (text: string): string => {
    const plainText = text.replace(/<\/?[^>]+(>|$)/g, "").trim(); // Remove HTML tags
    const totalCharacters = plainText.length;
    const readingTime = Math.ceil(totalCharacters / 1200); // Divide by 1200 and round up
    return `${readingTime} min read`;
  };

  const timeToReadCalculated = calculateTimeToRead(description);
    
   
  
    const extractText = (html: string): string => {
        const plainText = html.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return plainText.length > 120 ? plainText.slice(0, 120) + "..." : plainText;
      };
  



      
  return (
    <div className="flex flex-col items-center justify-between bg-gray-900 text-white rounded-lg shadow-md px-6 py-4 space-x-4">
        <div className="flex justify-between w-full">
    <div className=" bg-red-600 text-xs font-semibold uppercase px-3 py-1 rounded flex items-center mb-2">
          {label}
        </div>
        <div className="   space-x-3 flex">
                    <button 
                     onClick={(event) => {
                        event.stopPropagation(); 
                        setBlogId(blogid);
                        setOpenEditModal(true);
                      }}
                    className="p-2 rounded border bg-gray-200 border-black  flex items-center justify-center">
                        <MdModeEditOutline className="text-black text-sm"/>
                    </button>
                    <button
                   onClick={(event) => {
                    event.stopPropagation(); 
                    setBlogId(blogid);
                    setOpenDeleteModal(true);
                     }}
                    className="p-2 rounded border bg-gray-200 border-black  flex items-center justify-center">
                        <MdDelete className="text-black text-sm"/>
                    </button>
                </div>

        </div>
  
    <div className=" flex items-center  w-full text-white rounded-lg  space-x-4">
      {/* Left Content */}
     
      <div className=" w-3/5">
        
        <h2 className="text-lg md:text-2xl font-bold">{title}</h2>
        <p className="text-gray-300">{extractText(description)}</p>
        <button
          onClick={()=>{
            setBlogId(blogid);
            setShowFullBlog(true);
          }}
          className="text-red-400 font-medium inline-flex items-center gap-1 hover:underline my-2"
        >
          Read more →
        </button>
        <div className="flex items-center justify-between space-x-2 text-sm text-gray-400">
          <span className="inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="w-4 h-4"
            >
              <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1a5.5 5.5 0 00-4.336 2.058.75.75 0 101.15.96A4 4 0 018 10.5c1.377 0 2.603.523 3.186 1.518a.75.75 0 101.147-.963A5.5 5.5 0 008 9z" />
            </svg>
            by {author || "Anonymous"}
          </span>
          <span>{timeToReadCalculated}</span>
        </div>
      </div>

      {/* Right Placeholder */}
      <div className="w-2/5 h-36 bg-gray-800 rounded-lg overflow-hidden">
  {image && (
    <img
      src={image}
      alt={title}
      className="w-full h-full object-cover rounded-lg"
    />
  )}
</div>
    </div>
    </div>
  );
};

export default Card;
