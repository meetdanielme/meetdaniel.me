import assert from 'node:assert/strict';
import test from 'node:test';
import { optimiseRightNowImage, prepareRightNowUpload } from './right-now-upload';

test('compresses four large photos under the request budget and preserves metadata/order', async () => {
  let closed = 0;
  const sizes: number[][] = [];
  const originalBitmap = globalThis.createImageBitmap;
  const originalDocument = globalThis.document;
  globalThis.createImageBitmap = async () => ({ width: 4032, height: 3024, close: () => closed++ }) as ImageBitmap;
  globalThis.document = { createElement: () => {
    const canvas = {
      width: 0, height: 0,
      getContext: () => ({ drawImage() {} }),
      toBlob(callback: BlobCallback) {
        sizes.push([canvas.width, canvas.height]);
        callback(new Blob([new Uint8Array(800_000)], { type: 'image/webp' }));
      },
    };
    return canvas;
  } } as unknown as Document;
  try {
    const data = new FormData();
    data.set('text', 'A day out');
    data.set('location', 'Cork, Ireland');
    data.set('altText', 'One\nTwo\nThree\nFour');
    for (let i = 0; i < 4; i++) data.append('media', new File([new Uint8Array(5_000_000)], `${i}.jpg`, { type: 'image/jpeg' }));
    const result = await prepareRightNowUpload(data);
    assert.equal(result.get('location'), 'Cork, Ireland');
    assert.equal(result.get('altText'), 'One\nTwo\nThree\nFour');
    assert.equal(result.get('text'), 'A day out');
    assert.deepEqual(result.getAll('media').map(file => (file as File).name), ['0.webp', '1.webp', '2.webp', '3.webp']);
    assert.ok((await new Response(result).blob()).size < 4_000_000);
    assert.deepEqual(sizes, Array(4).fill([2048, 1536]));
    assert.equal(closed, 4);
  } finally {
    globalThis.createImageBitmap = originalBitmap;
    globalThis.document = originalDocument;
  }
});

test('preserves GIFs and rejects oversized uploads before sending', async () => {
  const gif = new File(['GIF89a'], 'animation.gif', { type: 'image/gif' });
  assert.equal(await optimiseRightNowImage(gif), gif);
  const data = new FormData();
  data.append('media', new File([new Uint8Array(4_000_000)], 'video.mp4', { type: 'video/mp4' }));
  await assert.rejects(prepareRightNowUpload(data), /still too large/);
});
