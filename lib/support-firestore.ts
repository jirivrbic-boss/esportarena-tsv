import type { SupportArticle, SupportCategoryId } from "@/lib/support-data";

export type SupportFaqRow = SupportArticle & {
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SupportTicketRow = {
  id: string;
  visitorEmail: string;
  visitorName?: string;
  categoryId?: SupportCategoryId | "";
  subject: string;
  message: string;
  createdAt: string;
  status: "open" | "answered";
  adminReply?: string | null;
  repliedAt?: string | null;
  repliedByEmail?: string | null;
};

export function rowToSupportArticle(
  row: Record<string, unknown> & { id: string }
): SupportFaqRow | null {
  const categoryId = row.categoryId as SupportCategoryId | undefined;
  const title = typeof row.title === "string" ? row.title : "";
  const body = typeof row.body === "string" ? row.body : "";
  if (!categoryId || !title.trim() || !body.trim()) return null;
  return {
    id: row.id,
    categoryId,
    tag: typeof row.tag === "string" ? row.tag : undefined,
    title: title.trim(),
    body: body.trim(),
    sortOrder: typeof row.sortOrder === "number" ? row.sortOrder : 0,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : undefined,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : undefined,
  };
}

export function rowToTicket(
  row: Record<string, unknown> & { id: string }
): SupportTicketRow | null {
  const visitorEmail =
    typeof row.visitorEmail === "string" ? row.visitorEmail.trim() : "";
  const message = typeof row.message === "string" ? row.message : "";
  if (!visitorEmail || !message.trim()) return null;
  const status = row.status === "answered" ? "answered" : "open";
  return {
    id: row.id,
    visitorEmail,
    visitorName:
      typeof row.visitorName === "string" ? row.visitorName.trim() : undefined,
    categoryId:
      typeof row.categoryId === "string"
        ? (row.categoryId as SupportCategoryId)
        : undefined,
    subject:
      typeof row.subject === "string" && row.subject.trim()
        ? row.subject.trim()
        : "Dotaz z centra podpory",
    message: message.trim(),
    createdAt:
      typeof row.createdAt === "string"
        ? row.createdAt
        : new Date(0).toISOString(),
    status,
    adminReply:
      row.adminReply === undefined || row.adminReply === null
        ? undefined
        : String(row.adminReply),
    repliedAt:
      typeof row.repliedAt === "string" ? row.repliedAt : undefined,
    repliedByEmail:
      typeof row.repliedByEmail === "string" ? row.repliedByEmail : undefined,
  };
}
