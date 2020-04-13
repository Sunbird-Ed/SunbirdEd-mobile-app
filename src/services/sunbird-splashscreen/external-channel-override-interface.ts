export interface ExternalChannelOverrideListener {
  onChannelDetected(
    event: {
      url: string,
      courseId: string;
      channelId: string,
      extras: {
        profile?: {
          userType?: string,
          langCode?: string
        }
      };
    },
    callback: () => {}): void;
}
