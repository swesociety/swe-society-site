"use client";
import { useToast } from "@/components/ui/use-toast";
import { getJWT } from "@/data/cookies/getCookies";
import { BACKENDURL } from "@/data/urls";
import axios from "axios";
import React, { useState } from "react";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import HtmlContent from "./HtmlContent";
import { IoChevronBack } from "react-icons/io5";
import { FaUser } from "react-icons/fa";

interface Blog {
    blogid: number;
    userid: number;
    headline: string;
    designation: string | null;
    current_institution: string | null;
    article: string;
    photos: string[];
    blogtype: string;
    approval_status: boolean;
    fullname: string | null;
  }

interface CardProps {
  blogDetails: Blog;
 
  setShowFullBlog: React.Dispatch<React.SetStateAction<boolean>>;
}

const FullBlogCard: React.FC<CardProps> = ({
 
    blogDetails,
  setShowFullBlog
}) => {

  const calculateTimeToRead = (text: string): string => {
    const plainText = text.replace(/<\/?[^>]+(>|$)/g, "").trim(); // Remove HTML tags
    const totalCharacters = plainText.length;
    const readingTime = Math.ceil(totalCharacters / 1200); // Divide by 1200 and round up
    return `${readingTime} min read`;
  };

  const timeToReadCalculated = calculateTimeToRead(blogDetails.article);
    
   
  
    const extractText = (html: string): string => {
        const plainText = html.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return plainText.length > 120 ? plainText.slice(0, 120) + "..." : plainText;
      };
  



      
  return (
    <div className="flex flex-col items-center  bg-gray-900 text-white rounded-lg shadow-md px-6 py-4 space-x-4 w-full ">
        <div className="w-full flex justify-start">
            <button
            onClick={()=>{
                setShowFullBlog(false);
            }}
            className="flex items-center space-x-3">
                <IoChevronBack />
                <div>Back</div>
            </button>
        </div>
        
         {blogDetails.photos && blogDetails.photos.length >0 && (
    <img
      src={blogDetails.photos[0]}
      alt={blogDetails.headline}
      className="mt-2 w-full lg:w-3/5 h-[50vh] object-cover rounded-lg"
    />
  )}
        
    {/* <div className=" bg-red-600 text-xs font-semibold uppercase px-3 py-1 rounded flex items-center mb-2">
          {blogDetails.blogtype}
        </div> */}
        <div className="mx-2 xl:mx-20">
        <div className="w-full flex items-center justify-between space-x-2 md:text-md text-sm text-gray-200 my-5">
          <div className="flex space-x-2 items-center gap-1">
          <FaUser />
            by {blogDetails.fullname || "Anonymous"}
          </div>
          <div>{timeToReadCalculated}</div>
        </div>
    

        
  
    <div className=" flex items-center  w-full text-white rounded-lg  space-x-4">
      {/* Left Content */}
     
      <div className=" w-full">
        
        <h2 className="text-2xl font-bold">{blogDetails.headline}</h2>
        <p className="text-gray-300"> <HtmlContent content={blogDetails.article} /></p>
       

      </div>

      {/* Right Placeholder */}
      
    </div>
    </div>
    </div>
  );
};

export default FullBlogCard;
