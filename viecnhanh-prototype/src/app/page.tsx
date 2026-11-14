import { redirect } from "next/navigation";

// Trang giới thiệu đã chuyển sang /hub; giữ "/" để link cũ không gãy.
export default function Root() {
  redirect("/hub");
}
