import { CoachWelcomeBase } from "./coachwelcome";
import type { RenderData } from "./types";

/** The coach welcome on the light off-white ground: first name in the deep club colour, surname in ink. */
export function Coachwelcomelight({ data }: { data: RenderData }) {
  return <CoachWelcomeBase data={data} theme="light" />;
}
