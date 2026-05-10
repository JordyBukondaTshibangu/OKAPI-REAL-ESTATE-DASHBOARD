import CreateAccountForm from "./molecules/form";
import CreateAccountFormHeader from "./molecules/form-header";

function CreateAccount() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-muted">
      <div className="relative mx-auto flex flex-col items-center justify-between w-full max-w-150 min-h-138.5 max-h-166.5 rounded-lg border border-t-0 bg-card p-12 gap-14 shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-border rounded-tr-3xl">
          <div className="h-1 w-59 bg-line-gradient rounded-tl-3xl" />
        </div>

        <div className="flex flex-col w-full gap-10">
          <CreateAccountFormHeader />
          <CreateAccountForm />
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
