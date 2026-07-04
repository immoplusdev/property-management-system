import { notFound } from "next/navigation";
import { getRoom } from "@/lib/api/pms/rooms.actions";
import { RoomDetail } from "@/components/pms/modules/RoomDetail";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const res = await getRoom(roomId);
  if (!res.ok) notFound();
  return <RoomDetail room={res.data} />;
}
