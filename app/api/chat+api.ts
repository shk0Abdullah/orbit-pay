import { OpenAI } from "openai";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OpenAI API Key is missing. Make sure OPENAI_API_KEY is set in your .env file.");
            return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });
        const { message } = await req.json();
        const { SYSTEM_PROMPT } = await import("../../constants/prompt");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: message },
            ],
        });

        return Response.json({
            reply: completion.choices[0].message.content,
        });
    } catch (error) {
        console.error("Chat API Error:", error);
        return Response.json({ error: "Failed to process request" }, { status: 500 });
    }
}
