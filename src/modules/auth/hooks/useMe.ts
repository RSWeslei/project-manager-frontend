import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profile, uploadUserPhoto } from '@/modules/auth/services/auth.api';
import { User } from '@/modules/auth/types';

export const useProfile = () => {
  return useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: profile,
    staleTime: 30 * 60_000, // 30 minutos
  });
};

export const useUpdateMyPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, File>({
    mutationFn: (file) => uploadUserPhoto(file),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['me'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['me'] }).then();
    },
  });
};
