export type FieldSource = "user" | "clarified" | "inferred" | "missing";

export type ExperimentField =
  | "instrument"
  | "timeframe"
  | "entryCondition"
  | "exitCondition"
  | "holdingPeriod"
  | "filters"
  | "objective";

export type ExperimentSources = Record<ExperimentField, FieldSource>;

export type Experiment = {
  instrument: string | null;
  timeframe: string | null;
  entryCondition: string | null;
  exitCondition: string | null;
  holdingPeriod: string | null;
  filters: string[];
  objective: string | null;
  missingFields: string[];
  sources: ExperimentSources;
};
