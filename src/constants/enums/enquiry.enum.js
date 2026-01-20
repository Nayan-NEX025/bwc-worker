export const ENQUIRY_STATUS = {
  NEW: "new", // User submitted but admin has not opened i
  SEEN: "seen", // Admin viewed the enquiry but didn’t take action yet
  IN_PROGRESS: "in_progress", // Admin is processing or contacting user
  FOLLOW_UP: "follow_up", // Waiting for user response
  RESPONDED: "responded", // Admin replied to user
  CLOSED: "closed", // Enquiry resolved
  REJECTED: "rejected", // Invalid/Fake/spam/unqualified enquiry
};

export const ENQUIRY_STATUS_VALUES = Object.values(ENQUIRY_STATUS);

/**  
 * New → Seen → In Progress → Responded → Closed
                      ↘
                      Follow-Up → Closed
**/
