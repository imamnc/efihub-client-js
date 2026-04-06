import { EfihubClient } from "../EfihubClient";
import type { AttachmentSpec } from "../types";
export declare class WhatsappClient {
    private base;
    constructor(base: EfihubClient);
    /** List all registered WhatsApp agents/sessions. Returns empty array on failure. */
    agents(): Promise<any[]>;
    /**
     * Get the QR code image for an agent (as data:image/png;base64 string).
     * Returns null on failure.
     */
    agentQR(agentCode: string): Promise<string | null>;
    /**
     * Get connection status of an agent.
     * Returns 'connected' | 'disconnected' or null on failure.
     */
    agentStatus(agentCode: string): Promise<string | null>;
    /**
     * Check whether a phone number is a registered WhatsApp user.
     * Returns true if valid, false otherwise.
     */
    checkPhoneNumber(agentCode: string, number: string): Promise<boolean>;
    /**
     * Send a text message to a single recipient.
     * Phone numbers are automatically normalized to international format.
     * Returns true on HTTP success (2xx), false otherwise.
     */
    sendMessage(sender: string, to: string, message: string, ref_id?: string | null, ref_url?: string | null): Promise<boolean>;
    /**
     * Send a text message to a WhatsApp group.
     * Returns true on HTTP success (2xx), false otherwise.
     */
    sendGroupMessage(sender: string, to: string, message: string, ref_id?: string | null, ref_url?: string | null): Promise<boolean>;
    /**
     * Send a message with one or more file attachments to a single recipient.
     * Accepts: string path, Buffer/raw-contents spec, or path spec with custom name.
     * Returns true on HTTP success (2xx), false otherwise.
     */
    sendAttachment(sender: string, to: string, message: string, attachment: AttachmentSpec | AttachmentSpec[], ref_id?: string | null, ref_url?: string | null): Promise<boolean>;
    /**
     * Send a message with one or more file attachments to a WhatsApp group.
     * Returns true on HTTP success (2xx), false otherwise.
     */
    sendGroupAttachment(sender: string, to: string, message: string, attachment: AttachmentSpec | AttachmentSpec[], ref_id?: string | null, ref_url?: string | null): Promise<boolean>;
    /**
     * Retrieve recent messages for an agent and phone number.
     * Returns an array of message objects or empty array on failure.
     */
    getMessages(agentCode: string, phone: string, limit?: number): Promise<any[]>;
    private buildAttachmentForm;
}
