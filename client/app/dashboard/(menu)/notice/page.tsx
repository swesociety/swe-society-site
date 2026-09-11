import { getAllNotices } from "./actions";
import NoticeComponent from "./components/Notice";

export default async function Page() {
  const initialNotices = await getAllNotices();

  return <NoticeComponent initialNotices={initialNotices} />;
}