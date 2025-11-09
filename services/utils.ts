/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const getVideoDuration = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = (e) => {
      const errorEvent = e as ErrorEvent;
      reject(
        new Error(
          `Error loading video for duration check: ${errorEvent.message}`,
        ),
      );
    };
    video.src = url;
  });
};
