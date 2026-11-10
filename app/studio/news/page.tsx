import { redirect } from "next/navigation";

/** The legacy Newsroom is retired; stored posts are not deleted. */
export default function LegacyStudioNewsPage() {
  redirect("/studio");
}
