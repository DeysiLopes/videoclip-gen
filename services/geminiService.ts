/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
  Video,
  VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from '@google/genai';
import {VeoApiParams} from '../types';

export const generateVideo = async (
  params: VeoApiParams,
): Promise<{objectUrl: string; blob: Blob; uri: string; video: Video}> => {
  console.log('Starting video generation with params:', params);

  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const config: any = {
    numberOfVideos: 1,
    resolution: params.resolution,
    aspectRatio: params.aspectRatio,
  };

  const generateVideoPayload: any = {
    model: params.model,
    prompt: params.prompt,
    config: config,
  };

  if (params.inputVideo) {
    console.log('Extending previous video.');
    generateVideoPayload.video = params.inputVideo;
  }

  const referenceImagesPayload: VideoGenerationReferenceImage[] = [];

  if (params.referenceImages) {
    for (const img of params.referenceImages) {
      console.log(`Adding reference image: ${img.file.name}`);
      referenceImagesPayload.push({
        image: {
          imageBytes: img.base64,
          mimeType: img.file.type,
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      });
    }
  }

  if (params.styleImage) {
    console.log(
      `Adding style image as a reference: ${params.styleImage.file.name}`,
    );
    referenceImagesPayload.push({
      image: {
        imageBytes: params.styleImage.base64,
        mimeType: params.styleImage.file.type,
      },
      referenceType: VideoGenerationReferenceType.STYLE,
    });
  }

  if (referenceImagesPayload.length > 0) {
    generateVideoPayload.config.referenceImages = referenceImagesPayload;
  }

  console.log('Submitting video generation request...', generateVideoPayload);
  let operation = await ai.models.generateVideos(generateVideoPayload);
  console.log('Video generation operation started:', operation);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log('...Generating...');
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  if (operation?.response) {
    const videos = operation.response.generatedVideos;

    if (!videos || videos.length === 0) {
      throw new Error('No videos were generated.');
    }

    const firstVideo = videos[0];
    if (!firstVideo?.video?.uri) {
      throw new Error('Generated video is missing a URI.');
    }
    const videoObject = firstVideo.video;

    const url = decodeURIComponent(videoObject.uri);
    console.log('Fetching video from:', url);

    const res = await fetch(`${url}&key=${process.env.API_KEY}`);

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('Fetch error body:', errorBody);
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }

    const videoBlob = await res.blob();
    const objectUrl = URL.createObjectURL(videoBlob);

    return {objectUrl, blob: videoBlob, uri: url, video: videoObject};
  } else {
    console.error('Operation failed:', operation);
    // Attempt to extract more detailed error information if available
    const status = (operation as any)?.error?.message || 'No videos generated.';
    throw new Error(status);
  }
};
