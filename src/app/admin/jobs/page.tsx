import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminJobs() {
  const jobs = await prisma.syncJob.findMany({ take: 100, orderBy: { scheduledAt: "desc" } });
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Sync Jobs</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="p-2">Type</th>
              <th className="p-2">Game</th>
              <th className="p-2">Status</th>
              <th className="p-2">Started</th>
              <th className="p-2">Finished</th>
              <th className="p-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t border-border">
                <td className="p-2">{j.jobType}</td>
                <td className="p-2">{j.game}</td>
                <td className="p-2">{j.status}</td>
                <td className="p-2 num-mono">{j.startedAt?.toISOString().slice(0, 16) ?? "-"}</td>
                <td className="p-2 num-mono">{j.finishedAt?.toISOString().slice(0, 16) ?? "-"}</td>
                <td className="p-2 text-red-400">{j.lastError?.slice(0, 60) ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
