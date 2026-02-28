import { api } from "./api";
import type { TrainerListItem, TrainerProfile } from "../types/trainer.types";
import type { ClientListItem } from "../types/client.types";

export const fetchExploreClients = () =>
  api<ClientListItem[]>("/trainer/explore-clients");


export const fetchTrainerProfile = () =>
  api<TrainerProfile>("/trainers/me");

export const fetchTrainers = () =>
  api<TrainerListItem[]>("/trainers");

export const updateTrainerProfile = (expertise: string[]) =>
  api<TrainerProfile>("/trainers/me", {
    method: "PUT",
    body: JSON.stringify({ expertise })
  });
