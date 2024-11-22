import Intro from "./components/intro";
import Samples from "./components/samples";

export default function Home() {
  return (
    <>
    <div className="h-dvh snap-y snap-mandatory overflow-auto bg-neutral-950 scrollbar-none">
      <Intro/>
      <Samples/>
    </div>
    </>
      );
}
