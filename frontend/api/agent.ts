// api/agent.ts - Munshi Agent API with SSE Streaming Support

import { apiClient } from './client';

export interface AgentStreamEvent {
    type: 'acknowledgment' | 'waiting' | 'text' | 'final' | 'error' | 'routing' | 'routed' | 'complete' | 'UNKNOWN' | 'INVENTORY_DRAFT' | 'FINANCE_ANSWER';
    message?: string;
    chunk?: string;
    fullText?: string;
    success?: boolean;
    intent?: string;
    reply?: string;
    payload?: any;
    data?: any;
    isVisual?: boolean;
    confidence?: number;
}

export interface AgentResponse {
    success: boolean;
    intent?: string;
    reply?: string;
    payload?: any;
    message?: string;
}

/**
 * Send a query to the agent and get a non-streaming response
 */
export const askAgent = async (query: string): Promise<AgentResponse> => {
    try {
        const response = await apiClient.post<AgentResponse>('/agent/ask', {
            query
        });
        return response.data;
    } catch (error: any) {
        console.error('Agent API error:', error);
        throw new Error(error?.response?.data?.message || 'Failed to communicate with Munshi');
    }
};

/**
 * Stream a query to the agent and receive Server-Sent Events
 * Returns an async generator that yields events as they arrive
 *
 * Uses XMLHttpRequest for React Native compatibility
 */
export async function* streamAgentQuery(query: string): AsyncGenerator<AgentStreamEvent> {
    const baseURL = apiClient.defaults.baseURL || '';
    const url = `${baseURL}/agent/ask/stream`;

    // Get auth token
    const authHeader = await getAuthHeader();

    // Create a promise-based stream using XMLHttpRequest
    const eventQueue: AgentStreamEvent[] = [];
    let isComplete = false;
    let streamError: Error | null = null;
    let resolveNext: ((value: IteratorResult<AgentStreamEvent>) => void) | null = null;

    const xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    if (authHeader.Authorization) {
        xhr.setRequestHeader('Authorization', authHeader.Authorization);
    }

    let lastProcessedIndex = 0;

    xhr.onprogress = () => {
        try {
            const responseText = xhr.responseText;
            console.log("📥 XHR Progress - Total length:", responseText.length);

            // Process new data since last check
            const newData = responseText.substring(lastProcessedIndex);
            console.log("🆕 New data:", newData.substring(0, 200)); // Log first 200 chars
            lastProcessedIndex = responseText.length;

            // Parse SSE events
            const lines = newData.split('\n');

            for (const line of lines) {
                const trimmedLine = line.trim();

                // SSE format: "data: {...}"
                if (trimmedLine.startsWith('data:')) {
                    const jsonStr = trimmedLine.slice(5).trim();

                    if (jsonStr) {
                        console.log("🔍 Parsing JSON:", jsonStr.substring(0, 100));
                        try {
                            const event: AgentStreamEvent = JSON.parse(jsonStr);
                            console.log("✅ Parsed event:", event.type, "Queue length:", eventQueue.length);
                            eventQueue.push(event);
                            console.log("📦 Added to queue. New queue length:", eventQueue.length);

                            // If someone is waiting for next event, wake them up
                            if (resolveNext) {
                                console.log("🎯 Waking up generator loop for event:", event.type);
                                const resolve = resolveNext;
                                resolveNext = null;
                                resolve({ value: undefined as any, done: false }); // Just wake up the loop
                            }
                        } catch (parseError) {
                            console.error('❌ Failed to parse SSE event:', jsonStr, parseError);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("❌ Error in onprogress:", error);
        }
    };

    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            isComplete = true;

            // Resolve any pending next() call
            if (resolveNext) {
                const resolve = resolveNext;
                resolveNext = null;
                resolve({ value: undefined as any, done: true });
            }
        } else {
            streamError = new Error(`HTTP ${xhr.status}: Failed to stream`);

            // Add error event to queue
            eventQueue.push({
                type: 'error',
                message: streamError.message
            });

            if (resolveNext) {
                const resolve = resolveNext;
                resolveNext = null;
                resolve({ value: eventQueue.shift()!, done: false });
            }

            isComplete = true;
        }
    };

    xhr.onerror = () => {
        streamError = new Error('Network request failed');

        // Add error event to queue
        eventQueue.push({
            type: 'error',
            message: streamError.message
        });

        if (resolveNext) {
            const resolve = resolveNext;
            resolveNext = null;
            resolve({ value: eventQueue.shift()!, done: false });
        }

        isComplete = true;
    };

    // Add readystatechange handler for debugging
    xhr.onreadystatechange = () => {
        console.log("📡 XHR State:", xhr.readyState, "Status:", xhr.status);
        if (xhr.readyState === 3) { // LOADING
            console.log("📥 Loading state - responseText available:", !!xhr.responseText);
        }
    };

    // Send the request
    console.log("🚀 Sending request to:", url);
    xhr.send(JSON.stringify({ query }));

    // Generator loop
    try {
        console.log("🔄 Starting generator loop");
        while (true) {
            // If we have events in queue, yield them
            if (eventQueue.length > 0) {
                const event = eventQueue.shift()!;
                console.log("⬆️ Yielding event from queue:", event.type);
                yield event;
                continue;
            }

            // If stream is complete and queue is empty, we're done
            if (isComplete) {
                console.log("✅ Stream complete, exiting generator loop");
                break;
            }

            // Wait for next event
            console.log("⏳ Waiting for next event...");
            await new Promise<IteratorResult<AgentStreamEvent>>((resolve) => {
                resolveNext = resolve;
            });

            // Check if we got an event or if stream completed
            if (eventQueue.length > 0) {
                const event = eventQueue.shift()!;
                console.log("⬆️ Yielding event after wait:", event.type);
                yield event;
            } else if (isComplete) {
                console.log("✅ Stream complete after wait, exiting generator loop");
                break;
            }
        }
    } catch (error: any) {
        console.error('Stream error:', error);
        yield {
            type: 'error',
            message: error?.message || 'Streaming failed'
        };
    } finally {
        console.log("🏁 Generator loop finished");
        // Clean up
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            xhr.abort();
        }
    }
}

/**
 * Helper to get auth header from storage
 */
async function getAuthHeader(): Promise<{ Authorization?: string }> {
    try {
        // Use expo-secure-store in React Native
        const SecureStore = await import('expo-secure-store');
        const token = await SecureStore.getItemAsync('authToken');

        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
    } catch (error) {
        console.error('Error reading auth token:', error);
    }

    return {};
}
