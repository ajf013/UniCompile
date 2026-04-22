import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session: any = await getServerSession();

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, language, filename, description } = await req.json();

  try {
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `token ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: description || "Code snippet from UniCompile",
        public: true,
        files: {
          [filename || `snippet.${language}`]: {
            content: code,
          },
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create gist");

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
