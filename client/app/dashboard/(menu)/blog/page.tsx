import { getAllBlogs } from './actions';
import AdminBlog from './components/AdminBlog';

export default async function Page() {
  const initialBlogs = await getAllBlogs();

  console.log('Initial Blogs:', initialBlogs);

  return <AdminBlog initialBlogs={initialBlogs} />;
}
