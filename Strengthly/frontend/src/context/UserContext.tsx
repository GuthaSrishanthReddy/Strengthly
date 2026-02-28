import { createContext, useState } from "react";
import type { UserProfile } from "../types/user.types";

type UserContextType = {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
};

export const UserContext = createContext<UserContextType>({
  userProfile: null,
  setUserProfile: () => {},
});

export const UserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};
