import axiosInstance from './axiosConfig';

export const getRecommendations = async () => {
    const response = await axiosInstance.get('/recommendations');
    return response.data;
};
