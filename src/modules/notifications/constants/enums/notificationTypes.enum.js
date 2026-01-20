export const NOTIFICATION_EVENTS = {
  /* =========================
   * COACH ↔ USER FLOW
   * ========================= */
  COACH_REQUEST_SENT: {
    label: "Coach request sent",
    defaultChannels: ["IN_APP"],
    roleScope: ["USER"],
  },

  COACH_REQUEST_APPROVED: {
    label: "Coach request approved",
    defaultChannels: ["IN_APP", "PUSH"],
    roleScope: ["USER"],
  },

  COACH_REQUEST_REJECTED: {
    label: "Coach request rejected",
    defaultChannels: ["IN_APP"],
    roleScope: ["USER"],
  },
};
