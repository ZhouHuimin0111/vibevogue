import { fal } from '@fal-ai/client';

fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

export interface TryOnInput {
  humanImage: string;
  garmentImage: string;
  garmentDescription?: string;
}

export interface TryOnResult {
  image: {
    url: string;
  };
}

export async function generateTryOn(input: TryOnInput): Promise<{ image: { url: string } }> {
  const result = await fal.subscribe('fal-ai/idm-vton', {
    input: {
      human_image: input.humanImage,
      garm_img: input.garmentImage,
      garment_description: input.garmentDescription || 'tops',
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_QUEUE') {
        console.log('Request is in queue...');
      } else if (update.status === 'IN_PROGRESS') {
        console.log('Processing...', update.logs);
      }
    },
  });

  return result as unknown as { image: { url: string } };
}
