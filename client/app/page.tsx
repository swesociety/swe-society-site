import {Footer} from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";
import AchievementSection from "@/components/homepage/AchievementSection";
// import AchievementSection from "@/components/homepage/AchievementSection";
// import BlogSection from "@/components/homepage/BlogSection";
import Carousel from "@/components/homepage/Carousel";
import ECMemberCarousel from "@/components/homepage/ECMemberCarousel";
import EventSection from "@/components/homepage/EventSection";
import Hero from "@/components/homepage/Hero";
import NoticeSection from "@/components/homepage/NoticeSection";
import BlogSection from "@/components/blogspage/blogSection";
import HomeBlogSection from "@/components/blogspage/homeBlogSection";
import HomeNoticeSection from "@/components/noticespage/homeNoticeSection";
import HomeEvent from "@/components/homepage/EventSection";
export default function Home() {
  return (
    <main>
      
    
     
      {/* <Carousel /> */}
      {/* <EventSection /> */}
  
      {/* <BlogSection /> */}
      <Hero />
       <HomeEvent/>
      <HomeNoticeSection/>
      <HomeBlogSection/>
      <AchievementSection />
      <ECMemberCarousel />
      <Footer/>
      {/* <GallerySection /> */}
    </main>
  );
}
