
"use client";
import { useState, useEffect } from "react";
import { CardStack } from "../ui/card-stack";
import Link from "next/link";
import { BACKENDURL } from "@/data/urls";

export function BlogCard() {
  const [blogs, setBlogs] = useState<any>([]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch(`${BACKENDURL}blog`);
        const data = await response.json();
        console.log(data);
        setBlogs(
          data.map((blog:any) => ({
            id: blog.blogid,
            name: blog.fullname || "Anonymous",
            designation: blog.designation,
            content: blog.article,
          }))
        );
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="h-[40rem] flex items-center justify-center w-full">
      <CardStack
        items={blogs.slice(0, 6).map((blog:any) => ({
          ...blog,
          content: (
            <Link href={`/blogs`} key={blog.id}>
              <div className="cursor-pointer">
                <h2>{blog.name}</h2>
                <p>{blog.designation}</p>
                <p>{blog.content}</p>
              </div>
            </Link>
          ),
        }))}
      />
    </div>
  );
}


