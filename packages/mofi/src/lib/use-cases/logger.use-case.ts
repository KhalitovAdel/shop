import { AbstractUseCase } from './abstract.use-case';

export interface ILogResultLogger<T> {
    log(msg: string, r: T): unknown;
}

export interface ILogErrorLogger {
    error(e: unknown): unknown;
}

export class Logger<REQUEST extends unknown[], RESPONSE> extends AbstractUseCase<REQUEST, RESPONSE> {
    constructor(
        private readonly logLogger: ILogResultLogger<RESPONSE>,
        private readonly errorLogger: ILogErrorLogger,
        private readonly useCase: AbstractUseCase<REQUEST, RESPONSE>
    ) {
        super();
    }
    public async exec(...args: REQUEST): Promise<RESPONSE> {
        try {
            const result = await this.useCase.exec(...args);

            this.logLogger.log('SUCCESS', result);
            return result;
        } catch (e) {
            this.errorLogger.error(e);
            throw e;
        }
    }
}
