export interface TrainerProfile {
  id: string;
  name: string;
  expertise: string[];
}

export interface TrainerListItem {
  id: string;
  expertise: string[];
  user: {
    name: string;
    email: string;
  };
}
