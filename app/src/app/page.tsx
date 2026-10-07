import { getSupabase, isConfigured, coupleId } from '@/lib/supabase';
import { sampleCouple, sampleMemories, sampleThings, sampleWishes } from '@/lib/sample-data';
import type { Couple, LittleThing, Memory, Wish } from '@/lib/types';
import { Hero } from '@/components/Hero';
import { Counter } from '@/components/Counter';
import { Timeline } from '@/components/Timeline';
import { LittleThings } from '@/components/LittleThings';
import { Wishlist } from '@/components/Wishlist';
import { Credits } from '@/components/Credits';

export const revalidate = 60; // refresh nội dung mỗi phút

export default async function Page() {
  const configured = isConfigured();
  let couple: Couple = sampleCouple;
  let memories: Memory[] = sampleMemories;
  let things: LittleThing[] = sampleThings;
  let wishes: Wish[] = sampleWishes;

  if (configured) {
    const sb = getSupabase()!;
    const cid = coupleId();
    const [cRes, mRes, tRes, wRes] = await Promise.all([
      sb.from('couples').select('id,name_a,name_b,start_date,hero_photo_url,love_letter').eq('id', cid).single(),
      sb.from('memories').select('*').eq('couple_id', cid).order('sort_order').order('date'),
      sb.from('little_things').select('*').eq('couple_id', cid).order('sort_order'),
      sb.from('wishes').select('*').eq('couple_id', cid).order('created_at'),
    ]);
    if (cRes.data) couple = cRes.data as Couple;
    if (mRes.data) memories = mRes.data as Memory[];
    if (tRes.data) things = tRes.data as LittleThing[];
    if (wRes.data) wishes = wRes.data as Wish[];
  }

  return (
    <main className="mx-auto max-w-[480px]">
      <Hero couple={couple} />
      <Counter couple={couple} />
      <Timeline memories={memories} />
      <LittleThings things={things} />
      <Wishlist wishes={wishes} configured={configured} coupleNames={[couple.name_a, couple.name_b]} />
      <Credits couple={couple} />
    </main>
  );
}
