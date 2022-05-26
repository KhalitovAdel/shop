export abstract class AbstractUseCase<REQUEST extends unknown[], RESPONSE> {
    public abstract exec(...args: REQUEST): Promise<RESPONSE>;
}
