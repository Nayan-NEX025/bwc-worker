import beamsClient from "../../config/pusherBeams.js";

export const publishPush = async ({ interests, title, body, data }) => {
  return beamsClient.publishToInterests(interests, {
    web: {
      notification: {
        title,
        body,
      },
      data,
    },
  });
};
