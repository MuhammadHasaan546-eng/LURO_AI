import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

interface Props {
  children: React.ReactNode;
}

const Providers = ({ children }: Props) => {
  return <ClerkProvider>{children}</ClerkProvider>;
};

export default Providers;
