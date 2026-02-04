import axiosInstance from "./axiosConfig";

export const getRiskQuestions = async () => {
  try {
    const response = await axiosInstance.get("/risk/questions");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitRiskAssessment = async (answers, userId, kycStatus) => {
  try {
    const response = await axiosInstance.post("/risk/assessment", {
      answers,
      user_id: userId,
      kyc_status: kycStatus,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
