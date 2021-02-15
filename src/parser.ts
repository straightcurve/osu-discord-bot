let _prefix = ".";
let commands: any = {};

export function setPrefix(prefix: string) {
    _prefix = prefix;
}

export function register(command: string, handler: (data: string) => void) {
    commands[command] = handler;
}

export function parse(message: string): string[] {
    if (!message.startsWith(_prefix))
        throw new ParseError(
            _prefix,
            false,
            `The message doesn't start with the required prefix, ${message}`
        );

    message = message.substring(_prefix.length);

    let command = message.split(" ")[0];
    if (!(command in commands))
        throw new ParseError(
            _prefix,
            true,
            "The command doesn't have a handler subscribed"
        );

    try {
        return [
            command,
            ...commands[command](
                message.substring(message.indexOf(command) + command.length + 1)
            ),
        ];
    } catch (ex) {
        console.trace(ex);

        return [];
    }
}

export class ParseError extends Error {
    constructor(
        public prefix: string,
        public hasPrefix: boolean,
        public message: string,
        public command?: string
    ) {
        super(message);
    }
}
