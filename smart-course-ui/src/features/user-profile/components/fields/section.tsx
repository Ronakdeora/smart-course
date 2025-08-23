import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = React.PropsWithChildren<{
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}>;

export function Section({
  title,
  description,
  collapsible = false,
  defaultOpen = true,
  children,
  className,
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : { duration: 0.24 };

  return (
    <Card
      className={`border-none shadow-sm bg-white/80 backdrop-blur rounded-2xl transition-shadow hover:shadow-lg ${
        className ?? ""
      }`}
    >
      <CardHeader className="pb-2">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={id}
            className="group w-full flex items-center justify-between text-left cursor-pointer rounded-xl px-2 py-1 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {description ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        ) : (
          <>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </>
        )}
      </CardHeader>

      <CardContent id={id}>
        {collapsible ? (
          <AnimatePresence initial={false}>
            <motion.div
              key="content"
              initial={open ? "open" : "collapsed"}
              animate={open ? "open" : "collapsed"}
              exit="collapsed"
              variants={{
                open: { height: "auto", opacity: 1 },
                collapsed: { height: 0, opacity: 0 },
              }}
              transition={transition}
              style={{ overflow: "hidden" }}
              aria-hidden={!open}
            >
              <div className="space-y-4">{children}</div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="space-y-4">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
