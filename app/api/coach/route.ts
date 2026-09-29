import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  prompt: z.string().min(1),
  userState: z.object({
    profile: z.any().optional(),
    programDays: z.array(z.any()).optional(),
    history: z.array(z.any()).optional(),
    bodyweightHistory: z.array(z.any()).optional(),
    checkins: z.array(z.any()).optional(),
  }).optional(),
});

const SYSTEM_PROMPT = `You are a direct, no-nonsense strength coach reviewing one lifter's progression data. The goal is hypertrophy through progressive overload. You are given precomputed statistics; use only those numbers and never invent data. Be concise and specific: name exercises and give exact weights. Recommend increases in realistic increments (cap suggested jumps at roughly 5% per week per lift, and smaller for upper-body isolation work). Be honest about diminishing returns: progress slows as training age grows, so do not give linear projections beyond a few months without flagging uncertainty and giving a range, not a single date. If a lift has stalled, list plausible causes (recovery, sleep, nutrition, volume, technique, deload timing) and a concrete next step. If the data is thin, say so. If the user mentions pain or possible injury, tell them to stop pushing that movement and see a qualified professional. No hype, no filler, no emoji. Keep answers under 200 words unless asked for detail.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.parse(body);
    const { prompt, userState } = parsed;

    // Server-side code precomputation of progression facts
    const exercises = (userState?.programDays || []).flatMap((d: any) =>
      (d.program_exercises || []).map((pe: any) => pe.exercise)
    );
    const history = userState?.history || [];

    const now = Date.now();

    const computedFacts = exercises.map((ex: any) => {
      const exHistory = history
        .filter((h: any) => h.exercise_id === ex.id && h.type === 'increase')
        .sort((a: any, b: any) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());

      const lastIncrease = exHistory[0];
      const daysSinceIncrease = lastIncrease
        ? Math.floor((now - new Date(lastIncrease.date_time).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Rate of progression over last 4 weeks (kg/wk)
      const fourWeeksAgo = now - 28 * 24 * 60 * 60 * 1000;
      const recent4w = exHistory.filter(
        (h: any) => new Date(h.date_time).getTime() >= fourWeeksAgo
      );
      const kgGained4w = recent4w.reduce(
        (sum: number, h: any) => sum + Math.max(0, h.new_weight_kg - h.old_weight_kg),
        0
      );
      const rateKgPerWeek = Number((kgGained4w / 4).toFixed(2));

      return {
        name: ex.name,
        currentWeightKg: ex.current_weight_kg || 0,
        incrementKg: ex.increment_kg || 2.5,
        daysSinceIncrease,
        rateKgPerWeek,
        isStalled: daysSinceIncrease !== null && daysSinceIncrease >= 42,
      };
    });

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // If Gemini API Key is missing or placeholder, generate smart precomputed response
    if (!apiKey || apiKey.includes('placeholder')) {
      const stalledEx = computedFacts.filter((f: any) => f.isStalled);
      let responseText = '';

      if (prompt.toUpperCase().includes('WEEKLY REVIEW')) {
        responseText = `WEEKLY PROGRESSION REVIEW:\nActive Lifts Monitored: ${computedFacts.length}.\nStalled Lifts: ${stalledEx.length > 0 ? stalledEx.map((f: any) => `${f.name} (${f.daysSinceIncrease}d)`).join(', ') : 'None'}.\nRecommendation: Maintain default ${userState?.profile?.unit || 'kg'} plate increments. If stalled 6+ weeks, execute 10% deload for 1 week.`;
      } else if (prompt.toUpperCase().includes('INCREASE')) {
        responseText = `SUGGESTED WEIGHT INCREASES:\n` + computedFacts.slice(0, 4).map((f: any) => `- ${f.name}: Current ${f.currentWeightKg} kg -> Suggested target ${f.currentWeightKg + f.incrementKg} kg (+${f.incrementKg} kg jump)`).join('\n');
      } else if (prompt.toUpperCase().includes('STALL')) {
        responseText = stalledEx.length > 0
          ? `STALL ANALYSIS:\n${stalledEx.map((f: any) => `${f.name} has not increased in ${f.daysSinceIncrease} days. Plausible causes: central fatigue, caloric deficit, or volume overload. Next step: Deload to ${(f.currentWeightKg * 0.9).toFixed(1)} kg for 1 week.`).join('\n')}`
          : `STALL ANALYSIS:\nNo lifts currently exceed the 6-week stall threshold. Keep pushing standard progression.`;
      } else {
        responseText = `PROGRESSION ADVICE:\nFocus on progressive overload on main compound lifts. Ensure full recovery between training days. Name exact lifts when asking specific questions.`;
      }

      return NextResponse.json({
        reply: responseText,
        facts: computedFacts,
      });
    }

    // Call Gemini API via standard Google AI REST Endpoint
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const promptPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nPRECOMPUTED FACTS:\n${JSON.stringify(
                computedFacts,
                null,
                2
              )}\n\nUSER QUESTION: ${prompt}`,
            },
          ],
        },
      ],
    };

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json(
        { error: `Gemini API returned status ${geminiRes.status}: ${errText}` },
        { status: 500 }
      );
    }

    const resData = await geminiRes.json();
    const replyText =
      resData.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response content generated by coach.';

    return NextResponse.json({
      reply: replyText,
      facts: computedFacts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error processing coach request' },
      { status: 400 }
    );
  }
}
