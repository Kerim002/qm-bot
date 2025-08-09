import axios from "axios";
import { gql } from "graphql-request";
import dotenv from "dotenv";

dotenv.config();
const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_URL || "http://95.85.125.54:2025/graphq";

type GuestLoginResponse = {
  guestLogin: {
    sessionId: string;
    user: {
      id: string;
    };
  };
};

export async function guestLogin(deviceId: string) {
  try {
    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query: `
        mutation GuestLogin($deviceId: String!) {
          guestLogin(deviceId: $deviceId) {
            user { id }
            sessionId
          }
        }
      `,
        variables: { deviceId },
      },
      {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      sessionId: response.data.data.guestLogin.sessionId,
      userId: Number(response.data.data.guestLogin.user.id),
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
}
