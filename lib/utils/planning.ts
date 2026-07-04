import type { PlanningSlot, PlanningBlockedSlot } from "@/lib/api/pms/planning.actions";

export function isBlockedSlot(slot: PlanningSlot): slot is PlanningBlockedSlot {
  return "type" in slot && slot.type === "blocked";
}
