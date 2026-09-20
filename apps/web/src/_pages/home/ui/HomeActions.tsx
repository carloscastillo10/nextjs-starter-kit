import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import type { ComponentProps } from "react";

import { HOME_LINKS } from "../config/home-links";

type HomeActionsProps = ComponentProps<"div">;

export const HomeActions = ({ className, ...props }: HomeActionsProps) => (
  <div className={cn("flex w-full flex-col gap-4 sm:w-auto sm:flex-row", className)} {...props}>
    <a
      className={cn(buttonVariants({ size: "lg" }), "w-full rounded-full sm:w-40")}
      href={HOME_LINKS.deploy}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Image className="h-3.5 w-4 dark:invert" alt="" height={14} src="/vercel.svg" width={16} />
      Deploy Now
    </a>

    <a
      className={cn(
        buttonVariants({ size: "lg", variant: "outline" }),
        "w-full rounded-full sm:w-40",
      )}
      href={HOME_LINKS.docs}
      rel="noopener noreferrer"
      target="_blank"
    >
      Documentation
    </a>
  </div>
);
