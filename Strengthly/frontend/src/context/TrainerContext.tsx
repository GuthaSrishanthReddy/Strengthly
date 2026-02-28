import { createContext, useState } from "react";
import type { TrainerProfile } from "../types/trainer.types";

type TrainerContextType = {
  trainerProfile: TrainerProfile | null;
  setTrainerProfile: (profile: TrainerProfile | null) => void;
};

export const TrainerContext = createContext<TrainerContextType>({
  trainerProfile: null,
  setTrainerProfile: () => {},
});

export const TrainerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [trainerProfile, setTrainerProfile] =
    useState<TrainerProfile | null>(null);

  return (
    <TrainerContext.Provider
      value={{ trainerProfile, setTrainerProfile }}
    >
      {children}
    </TrainerContext.Provider>
  );
};
