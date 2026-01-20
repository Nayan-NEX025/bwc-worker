export const mockPayment = async ({ amount }) => {
  // simulate delay like real gateway
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    paymentId: `mock_pay_${Date.now()}`,
  };
};
