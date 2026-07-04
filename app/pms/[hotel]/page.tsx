import { redirect } from "next/navigation";

export default async function HotelPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel } = await params;
  redirect(`/pms/${hotel}/dashboard`);
}
