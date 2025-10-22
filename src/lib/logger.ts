import { prisma } from "./db";

export async function logMetric(
  kind: string,
  label?: string,
  value?: number,
  extra?: any
) {
  try {
    await prisma.metric.create({
      data: {
        kind,
        label,
        value,
        extra,
      },
    });
  } catch (error) {
    console.error("Failed to log metric:", error);
  }
}

export function logError(error: any, context?: string) {
  console.error(`[${context || "ERROR"}]`, error);
  logMetric("error", context, undefined, { message: error.message, stack: error.stack });
}



