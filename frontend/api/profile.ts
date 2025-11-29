import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

// Profile types
export interface UserProfileData {
  name: string;
  phone: string;
  address: string;
  preferredLanguage?: 'English' | 'Hindi' | 'Hinglish';
}

export interface GetProfileResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    phone: string;
    address: string;
    preferredLanguage?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    phone: string;
    address: string;
    preferredLanguage?: string;
    updatedAt: string;
  };
}

// Get user profile
export const getProfile = async (): Promise<GetProfileResponse> => {
  const response = await apiClient.get('/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (userId: number, data: UserProfileData): Promise<UpdateProfileResponse> => {
  const response = await apiClient.put(`/profile/${userId}`, data);
  return response.data;
};

// Custom hook for getting profile
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

// Custom hook for updating profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserProfileData }) =>
      updateProfile(userId, data),
    onSuccess: (data) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      console.log('Profile updated successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
};
