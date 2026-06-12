import { NextStudio } from "next-sanity/studio";
// Note: In Vite, we can just use the standard Studio component from sanity, but wait, next-sanity is for Next.js.
// Since this is Vite, we should use sanity directly.
import { Studio } from "sanity";
import config from "../../sanity.config";

export default function SanityStudio() {
  return (
    <div className="absolute inset-0 z-[9999] bg-black">
      <Studio config={config} />
    </div>
  );
}
