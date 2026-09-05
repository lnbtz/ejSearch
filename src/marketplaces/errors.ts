export class UpstreamError extends Error {
  constructor(
    public readonly provider: string,
    public readonly stage: string,
    public readonly status?: number,
    message?: string,
  ) {
    super(message ?? `${provider} failed during ${stage}`);
    this.name = 'UpstreamError';
  }
}
