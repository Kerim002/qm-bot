import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_URL || "http://95.85.125.54:2025/graphql";

console.log("graphql endpiond from env", process.env.GRAPHQL_URL);

// type GuestLoginResponse = {
//   guestLogin: {
//     sessionId: string;
//     user: {
//       id: string;
//     };
//   };
// };

export async function guestLogin(deviceId: string) {
  try {
    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query: `
        mutation BasicLogin{
          basicLogin(input: { username: "bot6000", password: "54321" }) {
          user {
            id
          }
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
      sessionId: response.data.data.basicLogin.sessionId,
      userId: Number(response.data.data.basicLogin.user.id),
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// export async function basicLogin(
//   payload: { username: string; password: string },
//   maxRetries = 3,
//   delayMs = 2000
// ) {
//   try {
//     const response = await axios.post(
//       GRAPHQL_ENDPOINT,
//       {
//         query: `
//         mutation BasicLogin($username:String!, $password:String!){
//           basicLogin(input: { username: $username, password: $password }) {
//           user {
//             id
//           }
//           sessionId
//           }
//         }
//       `,
//         variables: { ...payload },
//       },
//       {
//         timeout: 5000,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return {
//       sessionId: response.data.data.basicLogin.sessionId,
//       userId: Number(response.data.data.basicLogin.user.id),
//     };
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// }

export async function basicLogin(
  payload: { username: string; password: string },
  maxRetries = 5,
  delayMs = 3000
) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await axios.post(
        GRAPHQL_ENDPOINT,
        {
          query: `
          mutation BasicLogin($username:String!, $password:String!){
            basicLogin(input: { username: $username, password: $password }) {
              user { id }
              sessionId
            }
          }
        `,
          variables: { ...payload },
        },
        {
          timeout: 5000,
          headers: { "Content-Type": "application/json" },
        }
      );

      return {
        sessionId: response.data.data.basicLogin.sessionId,
        userId: Number(response.data.data.basicLogin.user.id),
      };
    } catch (err) {
      attempt++;
      console.log(
        `[basicLogin] Attempt ${attempt} failed: ${
          err instanceof Error ? err.message : err
        }`
      );

      if (attempt >= maxRetries) {
        throw new Error(`[basicLogin] Failed after ${maxRetries} attempts`);
      }

      // wait before retrying
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  throw new Error("Unexpected exit from basicLogin loop");
}
