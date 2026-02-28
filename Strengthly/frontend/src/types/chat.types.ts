export interface ChatMessage {
  id: string;
  sender: "user" | "trainer" | "ai";
  text: string;
}
