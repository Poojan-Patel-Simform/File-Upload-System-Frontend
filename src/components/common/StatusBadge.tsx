import { UPLOAD_STATUS_META } from "@/constants";
import { UploadStatus } from "@/types/local-uploads/adminApi";
import { cn } from "@/lib/utils";

/** Colored badge with icon for a server-side UploadStatus. */
const StatusBadge = ({ status }: { status: UploadStatus }) => {
  const meta = UPLOAD_STATUS_META[status];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium",
        meta.className,
      )}
    >
      <Icon className="size-3.5" />
      {meta.label}
    </span>
  );
};

export default StatusBadge;
