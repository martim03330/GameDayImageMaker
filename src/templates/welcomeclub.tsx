import type { RenderData } from "./types";
import { WelcomeThemed } from "./welcomelight";

/** The agency's welcome layout on the club's deep colour: first name off-white, surname in the second colour. */
export function Welcomeclub({ data }: { data: RenderData }) {
  return <WelcomeThemed data={data} theme="club" />;
}
