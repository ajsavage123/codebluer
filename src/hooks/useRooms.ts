// DEV BYPASS: Using mock data instead of Supabase (ERR_NAME_NOT_RESOLVED)
// TODO: Restore real Supabase queries when ready for production.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Room } from '@/types';
import { systemRooms } from '@/data/mockData';

let _mockRooms: Room[] = [...systemRooms];

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async (): Promise<Room[]> => _mockRooms,
  });
}

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: async (): Promise<Room | null> =>
      _mockRooms.find(r => r.id === roomId) ?? null,
    enabled: !!roomId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (room: Partial<Room>): Promise<Room> => {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: room.name ?? 'New Room',
        description: room.description ?? '',
        type: room.type ?? 'general',
        icon: room.icon ?? 'MessageCircle',
        isSystem: false,
        memberCount: 1,
        messageCount: 0,
        isAnonymous: room.isAnonymous ?? false,
      };
      _mockRooms = [..._mockRooms, newRoom];
      return newRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
