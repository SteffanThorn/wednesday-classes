import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "lib/utils";

const ChartContainer = React.forwardRef(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

    return (
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className,
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    );
  },
);
ChartContainer.displayName = "Chart";

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!hideLabel && label && <div className={cn("font-medium", labelClassName)}>{label}</div>}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const indicatorColor = color || item.payload.fill || item.color;

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2",
                  indicator === "dot" && "items-center",
                )}
              >
                {!hideIndicator && (
                  <div
                    className={cn("shrink-0 rounded-[2px]", {
                      "h-2.5 w-2.5": indicator === "dot",
                      "w-1": indicator === "line",
                      "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                    })}
                    style={{
                      backgroundColor: indicatorColor,
                      borderColor: indicatorColor,
                    }}
                  />
                )}
                <div className="flex flex-1 justify-between leading-none items-center">
                  <span className="text-muted-foreground">{item.name}</span>
                  {item.value && (
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {item.value.toLocaleString()}
                    </span>
                  )}
                </div>
            );
          })}
        </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef(
  ({ className, payload, verticalAlign = "bottom" }, ref) => {
    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
      >
        {payload.map((item) => (
          <div
            key={item.value}
            className="flex items-center gap-1.5"
          >
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: item.color,
              }}
            />
            <span className="text-sm text-muted-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    );
  },
);
ChartLegendContent.displayName = "ChartLegend";

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent };
