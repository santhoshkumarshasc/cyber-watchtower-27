import { queryOptions } from "@tanstack/react-query";

import { getThreatBriefing } from "./threats.functions";

export const briefingQueryOptions = queryOptions({
  queryKey: ["cyberguard", "briefing"],
  queryFn: () => getThreatBriefing(),
  staleTime: 60 * 1000, // 1 minute fresh
  refetchInterval: 60 * 1000, // Auto-update live threat telemetry every minute
  refetchIntervalInBackground: false,
  retry: false,
});
