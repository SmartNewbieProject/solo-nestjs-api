export interface ViewCountUpdate {
  articleId: string;
  count: number;
}

export interface BatchProcessResult {
  processedCount: number;
  successCount: number;
  failedCount: number;
  errors: Error[];
}

export function createEmptyBatchResult(): BatchProcessResult {
  return {
    processedCount: 0,
    successCount: 0,
    failedCount: 0,
    errors: []
  };
}

export function updateBatchResult(
  result: BatchProcessResult, 
  success: boolean, 
  error?: Error
): BatchProcessResult {
  return {
    ...result,
    processedCount: result.processedCount + 1,
    successCount: success ? result.successCount + 1 : result.successCount,
    failedCount: !success ? result.failedCount + 1 : result.failedCount,
    errors: error ? [...result.errors, error] : result.errors
  };
}
