import { notFound } from "next/navigation";
import { getRoom } from "@/lib/api/pms/rooms.actions";
import { RoomDetailModal } from "@/components/pms/modules/RoomDetailModal";

export default async function RoomModalPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const res = await getRoom(roomId);
  if (!res.ok) notFound();
  return <RoomDetailModal room={res.data} />;
}
