import IdentificationForm from "./molecules/Identification-form";
import IdentificationHero from "./molecules/Identification-hero";

function Identification() {
  return (
    <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-5 min-h-screen h-full px-5">
      <IdentificationForm />
      <IdentificationHero />
    </div>
  );
}

export default Identification;
