import Link from "next/link";
import { NoticeCard } from "../noticespage/NoticeCard";
import { Button } from "../ui/button";

function NoticeSection() {
  return (
    <div>
      <h1 className="flex flex-col items-center font-bold text-primary">Notices</h1>
      <NoticeCard />
      <Link href={'/notices'}>
      <div className='flex flex-col items-end justify-end p-10'>    
          <Button className='flex flex-col justify-center items-end'>All Notices</Button></div>
          </Link>
      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
    </div>
  );
}

export default NoticeSection;
