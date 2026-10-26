import { randomBytes } from "node:crypto";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "TEACHER") return Response.json({ error: "Teacher access required" }, { status: 403 });

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ courses });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "TEACHER") return Response.json({ error: "Teacher access required" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  if (!title || title.length > 120 || !subject || subject.length > 80 || description.length > 1000) {
    return Response.json({ error: "Enter a course title and subject. Keep the title under 120 characters and description under 1,000." }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: { teacherId: session.user.id, title, subject, description, joinCode: randomBytes(12).toString("hex").toUpperCase() },
    include: { _count: { select: { enrollments: true } } },
  });
  return Response.json({ course }, { status: 201 });
}
