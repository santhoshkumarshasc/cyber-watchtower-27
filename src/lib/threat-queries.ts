import { queryOptions } from "@tanstack/react-query";

import { getThreatBriefing } from "./threats.functions";

export const briefingQueryOptions = queryOptions({
  queryKey: ["cyberguard", "briefing"],
  queryFn: () => getThreatBriefing(),
  staleTime: 5 * 60 * 1000,
  retry: false,
});
