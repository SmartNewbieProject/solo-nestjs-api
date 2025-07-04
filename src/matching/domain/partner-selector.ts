import { WeightedPartner } from '@/types/match';

export function weightedRandomChoice<T = any>(
  partners: WeightedPartner[],
): WeightedPartner | null {
  if (!partners.length) return null;
  const total = partners.reduce((sum, p) => sum + p.finalWeight, 0);
  if (total === 0) return partners[0];
  let rand = Math.random() * total;
  for (const partner of partners) {
    if (rand < partner.finalWeight) return partner;
    rand -= partner.finalWeight;
  }
  return partners[0]; // fallback
}
