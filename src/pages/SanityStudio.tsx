import { Studio } from "sanity";
import config from "../../sanity.config";

export default function SanityStudio() {
  return (
    <div className="absolute inset-0 z-[9999] bg-black">
      <Studio config={config} />
    </div>
  );
}
