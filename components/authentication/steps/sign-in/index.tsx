import SignInForm from "./molecules/form";
import SignInFormHeader from "./molecules/form-header";

function SignIn() {
  return (
    <main className="flex items-center justify-center w-full min-h-screen bg-muted">
      <section className="relative flex flex-col w-140 max-w-150 min-w-50 h-125.5 px-12 py-10 gap-14 items-center justify-between rounded-lg border border-t-0 bg-card shadow-md">
        <div className="absolute top-0 left-0 right-1 h-1 w-[556.5px] bg-border rounded-tr-3xl">
          <div className="w-59 h-1 bg-line-gradient rounded-tl-3xl" />
        </div>

        <div className="flex flex-col w-full gap-10">
          <SignInFormHeader />
          <SignInForm />
        </div>
      </section>
    </main>
  );
}

export default SignIn;
