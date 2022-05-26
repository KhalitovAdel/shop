export class ParsingException extends Error {
    constructor(fieldName: string, receivedValue: unknown, expectedTag?: string) {
        const msg1 = `Could not initialize variable ${fieldName}, because received <${receivedValue}>`;
        const msg2 = `Could not initialize variable ${fieldName}, because tag: <${expectedTag}> not found in dom`;
        super(expectedTag ? msg2 : msg1);
    }
}
