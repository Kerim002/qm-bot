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
  | GameOverMessage
  | PlayerDisconnected
  | ItemBought
  | PlayerHealed
  | RecconnectedMessage
  | ErrorMessage;

export interface JoinedMessage {
  type: "player_joined";
  output: {
    game_id: number;
    player_id: number;
    player_name: string;
    player_position: [number, number];
  };
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export interface RecconnectedMessage {
  type: "player_reconnected";
  output: {
    game_id: string;
    player_id: number;
    players: PlayerSchema[];
    zones: ZoneSchema[];
    shop_items: ShopItemsSchema[];
    inventory: {
      [key: string]: number;
    };
    turn: {
      player_id: number;
      started_at: string;
      round: number;
      phase:
        | "AWAITING_MOVE"
        | "QUESTION_ASKED"
        | "QUESTION_ANSWERED"
        | "POST_MOVE";
      question_asked: {
        question_id: number;
        subject_id: number;
        prompt: string;
        options: string[];
        elo: number;
      };
    };
  };
}

export interface ZoneSchema {
  block: number;
  occupant_id: null;
  occupation_points: number;
  subject_id: number | null;
  subject_name: string | null;
}

export interface ItemBought {
  type: "item_bought";
  output: {
    game_id: string;
    player_id: number;
    item_type: string;
    remaining_coins: number;
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
    shop_items: {
      HEALING_POTION: ShopItemSchema;
      TELEPORT_STONE: ShopItemSchema;
      LUCKY_CHARM: ShopItemSchema;
    };
  };
}

export type ShopItemSchema = {
  name: string;
  description: string;
  price: number;
};

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

export interface PlayerHealed {
  type: "player_healed";
  output: {
    game_id: string;
    player_id: number;
    player_hp: number;
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
  output: {
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
  output: MovedOutput;
}

export interface MovedOutput {
  game_id: string;
  player_id: number;
  move_path: [number, number][];
  power_points: number;
  coins: number;
}

export interface ZoneOccupiedMessage {
  type: "zone_occupation_attempted";
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

export interface PlayerDisconnected {
  type: "player_disconnected";
}

export type ShopItemSchema = {
  name: string;
  description: string;
  price: number;
};

export type ShopItemsSchema = {
  [key: string]: ShopItem;
};

export type OccupiedPosition = {
  pos: number[];
  opSpent: number;
};
