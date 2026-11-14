import { redirect } from "next/navigation";

// No role picker: the preloader plays, then the worker lands on login. HR and Zalo OA stay reachable from the Demo panel.
export default function Home() {
  redirect("/worker");
}
