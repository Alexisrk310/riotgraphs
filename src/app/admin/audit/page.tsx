import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAudit() {
  const rows = await prisma.auditLog.findMany({ take: 200, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Audit Log</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="p-2">Time</th>
              <th className="p-2">Actor</th>
              <th className="p-2">Action</th>
              <th className="p-2">Target</th>
              <th className="p-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-2 num-mono">{r.createdAt.toISOString().slice(0, 19)}</td>
                <td className="p-2">{r.actorId ?? "system"}</td>
                <td className="p-2">{r.action}</td>
                <td className="p-2">{r.target ?? "-"}</td>
                <td className="p-2 num-mono">{r.ip ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
