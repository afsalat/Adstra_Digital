// -----------------------------------------------------------------------------
// DISABLED: This API route is incompatible with `next export` (static export)
// and requires an OPENAI_API_KEY which is missing.
// It appears to be unused in the project.
// -----------------------------------------------------------------------------

// import { NextResponse } from "next/server";
// import OpenAI from "openai";
//
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
//
// export async function POST(req) {
//   try {
//     const { title, type } = await req.json();
//
//     if (!title || !type) {
//       return NextResponse.json({ error: "Missing title or type" }, { status: 400 });
//     }
//
//     const prompt = `Write a ${type} section for the topic: "${title}"`;
//
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//     });
//
//     const content = response.choices[0]?.message?.content;
//
//     return NextResponse.json({ content });
//   } catch (error) {
//     // console.error("API Error:", error);
//     return NextResponse.json(
//       { error: error.message || "Something went wrong on the server." },
//       { status: 500 }
//     );
//   }
// }
