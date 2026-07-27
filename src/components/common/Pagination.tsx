import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  take: number;
  skip: number;
  total: number;
  onSkipChange: (skip: number) => void;
};

const Pagination = ({ take, skip, total, onSkipChange }: PaginationProps) => {
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + take, total);

  return (
    <div className="flex items-center justify-between gap-4 px-1 text-sm text-muted-foreground">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={skip === 0}
          onClick={() => onSkipChange(Math.max(0, skip - take))}
        >
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={skip + take >= total}
          onClick={() => onSkipChange(skip + take)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
