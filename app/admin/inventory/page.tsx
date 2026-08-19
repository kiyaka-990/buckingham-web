import { getDogs } from "@/lib/queries";
import { breeds } from "@/lib/data/breeds";
import { InventoryManager } from "@/components/admin/inventory-manager";

export const metadata = { title: "Inventory · Admin" };

export default async function AdminInventory() {
  const dogs = await getDogs();
  return <InventoryManager dogs={dogs} breeds={breeds} />;
}
