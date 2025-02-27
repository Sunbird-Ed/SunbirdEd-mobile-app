import dayjs from 'dayjs';

declare global {
  interface Window {
    dayjs: typeof dayjs;
  }
}