import Email from "./email.model.js";
import EmailCampaign from "./models/../campaigns/emailCampaign.model.js";

// sent -> delivered -> opened -> clicked
export async function handleEmailSent(data) {
  await Email.updateOne(
    { resendId: data.email_id },
    {
      status: "sent",
      sentAt: data.created_at,
    },
  );
}

export async function handleEmailDelivered(data) {
  const email = await Email.findOneAndUpdate(
    { resendId: data.email_id },
    {
      status: "delivered",
      deliveredAt: data.created_at,
    },
    { new: true }, // THIS actually works here
  );

  console.log("delivered email:", email?._id);

  if (!email) return;

  console.log("completing............");
  await checkAndCompleteCampaign(email);
}

export async function handleEmailOpened(data) {
  await Email.updateOne(
    { resendId: data.email_id },
    {
      status: "opened",
      openedAt: data.open.created_at,
      openMeta: {
        ip: data.open.ipAddress,
        userAgent: data.open.userAgent,
      },
    },
  );
}
// when a link on mail is clicked
// When the email.clicked event is triggered, the clicked link URL is included in the webhook payload under data.click.link.
export async function handleEmailClicked(data) {
  await Email.updateOne(
    { resendId: data.email_id },
    {
      status: "clicked",
      clickedAt: data.click.timestamp,
      clickMeta: {
        link: data.click.link,
        ip: data.click.ipAddress,
        userAgent: data.click.userAgent,
      },
    },
  );
}

// Event triggered whenever the email failed to send due to an error.
export async function handleEmailFailed(type, data) {
  await Email.updateOne(
    { resendId: data.email_id },
    {
      status: "failed",
      failureType: type,
      failedAt: data.created_at,
    },
  );
}

// Event triggered whenever the email was successfully delivered, but the recipient marked it as spam.
export async function handleEmailComplained(data) {
  await Email.updateOne(
    { resendId: data.email_id },
    {
      status: "complained",
      complainedAt: data.created_at,
    },
  );

  // 🔒 OPTIONAL: block user from emails
}

async function checkAndCompleteCampaign(email) {
  console.log("inside check and complete...");
  if (!email.campaign) return;

  const remaining = await Email.countDocuments({
    campaign: email.campaign,
    status: {
      $nin: ["delivered", "opened", "clicked", "failed", "complained"], // Terminal (final) states
    }, // Non-terminal (in-progress) states -> ["queued", "processing", "sent"]
  });

  console.log("check and complete campaign: ", remaining);
  if (remaining === 0) {
    await EmailCampaign.updateOne(
      { _id: email.campaign },
      {
        status: "completed",
        completedAt: new Date(),
      },
    );
  }
  console.log("completed....................");
}
