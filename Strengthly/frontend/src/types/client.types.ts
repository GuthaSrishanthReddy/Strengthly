export interface ClientListItem {
  id: string;          // ClientTrainer.id
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
}
