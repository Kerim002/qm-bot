// ===============================
// Incoming WebSocket messages
// ===============================
export type WSMessage =
  | JoinedMessage
  | GameStartedMessage
  | RoundStartedMessage
  | TurnStartedMessage
  | QuestionAskedMessage
  | AnswerResultMessage
  | MovedMessage
  | ZoneOccupiedMessage
  | GameOverMessage;

export interface JoinedMessage {
  type: "player_joined";
  output: {
    game_id: number;
    player_id: number;
    player_name: string;
    player_position: [number, number];
  };
}

export interface GameStartedMessage {
  type: "game_started";
  output: {
    players: PlayerSchema[];
    zones: {
      block: number;
      subject_id: number | null;
      subject_name: string | null;
      occupant_id: number | null;
      occupation_points: number;
    }[];
  };
}

export interface RoundStartedMessage {
  type: "round_started";
  output: {
    game_id: string;
    round_number: number;
    players: PlayerSchema[];
  };
}

export interface TurnStartedMessage {
  type: "turn_started";
  output: {
    game_id: string;
    player_id: number;
  };
}

export interface QuestionAskedMessage {
  type: "question_asked";
  output: {
    game_id: string;
    player_id: number;
    question_id: number;
    subject_id: number;
    prompt: string;
    options: string[];
    elo: number;
  };
}

export interface AnswerResultMessage {
  type: "answer_result";
  input: {
    game_id: number;
    player_id: number;
    question_id: number;
    player_subject_elo: number;
    question_elo: number;
    delta_player_subject: number;
    delta_question: number;
    is_correct: boolean;
    answer: number;
  };
}

export interface MovedMessage {
  type: "player_moved";
  output: {
    game_id: string;
    player_id: number;
    move_path: [number, number][];
    power_points: number;
    coins: number;
  };
}

export interface ZoneOccupiedMessage {
  type: "zone_occupied";
  output: {
    game_id: string;
    player_id: number;
    id: number;
    subject_id: number;
    occupation_points: number;
    occupied_by: number | null;
  };
}

export interface GameOverMessage {
  type: "game_over";
  output: {
    game_id: number;
    winner: number;
    total_delta: number;
  };
}

export interface PlayerSchema {
  id: number;
  name: string;
  position: [number, number];
  hp: number;
  coins: number;
  power_points: number;
}
