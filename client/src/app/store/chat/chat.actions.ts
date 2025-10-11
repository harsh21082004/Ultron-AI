import { createAction, props } from '@ngrx/store';

// Dispatched from the component when the user sends a message
export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ message: string }>()
);

// Dispatched by the effect when the streaming connection is successfully established
export const streamStarted = createAction(
  '[Chat] Stream Started'
);

// Dispatched by the effect for each piece of text received from the stream
export const receiveStreamChunk = createAction(
  '[Chat] Receive Stream Chunk',
  props<{ chunk: string }>()
);

// Dispatched by the effect when the stream is complete
export const streamComplete = createAction(
  '[Chat] Stream Complete'
);

// Dispatched by the effect if there is an error during streaming
export const streamFailure = createAction(
  '[Chat] Stream Failure',
  props<{ error: string }>()
);
