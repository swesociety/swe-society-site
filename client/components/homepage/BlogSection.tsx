import {BlogCard} from "../blogspage/BlogCard";
import Link from "next/link";
import { Button } from "../ui/button";
function BlogSection() {
  return (
    <div>
      {/* <h1 className="flex flex-col items-center">Blogs</h1> */}
      <h1 className="flex flex-col items-center font-bold text-primary">Blogs</h1>
      
      <BlogCard />
      <Link href={'/blogs'}>
      <div className='flex flex-col items-end justify-end p-10'>    
          <Button className='flex flex-col justify-center items-end'>All Blogs</Button></div>
          </Link>
      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
    </div>
  );
}

export default BlogSection;
