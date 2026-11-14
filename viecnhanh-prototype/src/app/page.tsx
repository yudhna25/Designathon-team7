import { redirect } from "next/navigation";

// Preloader, then straight into the jobs. Login is optional until the worker wants to apply.
export default function Home() {
  redirect("/worker/jobs");
}
