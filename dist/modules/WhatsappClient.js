"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappClient = void 0;
const form_data_1 = __importDefault(require("form-data"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
/**
 * Normalize an Indonesian phone number to international format (62xxxxxxxxxx).
 * Accepts formats: +628xx, 08xx, 628xx.
 */
function normalizePhone(number) {
    let n = number.replace(/[\s\-().]/g, "");
    if (n.startsWith("+"))
        n = n.slice(1);
    if (n.startsWith("0"))
        n = "62" + n.slice(1);
    return n;
}
function appendAttachmentToForm(form, spec) {
    if (typeof spec === "string") {
        form.append("attachment[]", node_fs_1.default.createReadStream(spec), node_path_1.default.basename(spec));
    }
    else if ("contents" in spec) {
        const buf = Buffer.isBuffer(spec.contents)
            ? spec.contents
            : Buffer.from(spec.contents);
        const contentType = spec.headers?.["Content-Type"];
        form.append("attachment[]", buf, {
            filename: spec.filename,
            ...(contentType ? { contentType } : {}),
        });
    }
    else {
        form.append("attachment[]", node_fs_1.default.createReadStream(spec.path), spec.filename ?? node_path_1.default.basename(spec.path));
    }
}
class WhatsappClient {
    constructor(base) {
        this.base = base;
    }
    /** List all registered WhatsApp agents/sessions. Returns empty array on failure. */
    async agents() {
        try {
            const resp = await this.base.get("/whatsapp/sessions");
            return resp.data?.data ?? resp.data ?? [];
        }
        catch {
            return [];
        }
    }
    /**
     * Get the QR code image for an agent (as data:image/png;base64 string).
     * Returns null on failure.
     */
    async agentQR(agentCode) {
        try {
            const resp = await this.base.get(`/whatsapp/sessions/qrcode/${agentCode}`);
            return resp.data?.data?.qr ?? resp.data?.qr ?? null;
        }
        catch {
            return null;
        }
    }
    /**
     * Get connection status of an agent.
     * Returns 'connected' | 'disconnected' or null on failure.
     */
    async agentStatus(agentCode) {
        try {
            const resp = await this.base.get(`/whatsapp/sessions/status/${agentCode}`);
            return resp.data?.data?.status ?? resp.data?.status ?? null;
        }
        catch {
            return null;
        }
    }
    /**
     * Check whether a phone number is a registered WhatsApp user.
     * Returns true if valid, false otherwise.
     */
    async checkPhoneNumber(agentCode, number) {
        try {
            const normalized = normalizePhone(number);
            const resp = await this.base.get(`/whatsapp/user/exists/${agentCode}/${normalized}`);
            return resp.data?.data?.exists ?? resp.data?.exists ?? false;
        }
        catch {
            return false;
        }
    }
    /**
     * Send a text message to a single recipient.
     * Phone numbers are automatically normalized to international format.
     * Returns true on HTTP success (2xx), false otherwise.
     */
    async sendMessage(sender, to, message, ref_id, ref_url) {
        try {
            const resp = await this.base.post("/whatsapp/message", {
                sender,
                to: normalizePhone(to),
                message,
                ...(ref_id != null && { ref_id }),
                ...(ref_url != null && { ref_url }),
            });
            return resp.status >= 200 && resp.status < 300;
        }
        catch {
            return false;
        }
    }
    /**
     * Send a text message to a WhatsApp group.
     * Returns true on HTTP success (2xx), false otherwise.
     */
    async sendGroupMessage(sender, to, message, ref_id, ref_url) {
        try {
            const resp = await this.base.post("/whatsapp/message/group", {
                sender,
                to,
                message,
                ...(ref_id != null && { ref_id }),
                ...(ref_url != null && { ref_url }),
            });
            return resp.status >= 200 && resp.status < 300;
        }
        catch {
            return false;
        }
    }
    /**
     * Send a message with one or more file attachments to a single recipient.
     * Accepts: string path, Buffer/raw-contents spec, or path spec with custom name.
     * Returns true on HTTP success (2xx), false otherwise.
     */
    async sendAttachment(sender, to, message, attachment, ref_id, ref_url) {
        try {
            const form = this.buildAttachmentForm({ sender, to: normalizePhone(to), message, ref_id, ref_url }, attachment);
            const resp = await this.base.post("/whatsapp/message/attachment", form, { headers: form.getHeaders() });
            return resp.status >= 200 && resp.status < 300;
        }
        catch {
            return false;
        }
    }
    /**
     * Send a message with one or more file attachments to a WhatsApp group.
     * Returns true on HTTP success (2xx), false otherwise.
     */
    async sendGroupAttachment(sender, to, message, attachment, ref_id, ref_url) {
        try {
            const form = this.buildAttachmentForm({ sender, to, message, ref_id, ref_url }, attachment);
            const resp = await this.base.post("/whatsapp/message/group/attachment", form, { headers: form.getHeaders() });
            return resp.status >= 200 && resp.status < 300;
        }
        catch {
            return false;
        }
    }
    /**
     * Retrieve recent messages for an agent and phone number.
     * Returns an array of message objects or empty array on failure.
     */
    async getMessages(agentCode, phone, limit = 10) {
        try {
            const normalized = normalizePhone(phone);
            const resp = await this.base.get(`/whatsapp/messages/${agentCode}/${normalized}/${limit}`);
            return resp.data?.data ?? resp.data ?? [];
        }
        catch {
            return [];
        }
    }
    buildAttachmentForm(fields, attachment) {
        const form = new form_data_1.default();
        form.append("sender", fields.sender);
        form.append("to", fields.to);
        form.append("message", fields.message);
        if (fields.ref_id != null)
            form.append("ref_id", fields.ref_id);
        if (fields.ref_url != null)
            form.append("ref_url", fields.ref_url);
        const specs = Array.isArray(attachment) ? attachment : [attachment];
        for (const spec of specs) {
            appendAttachmentToForm(form, spec);
        }
        return form;
    }
}
exports.WhatsappClient = WhatsappClient;
