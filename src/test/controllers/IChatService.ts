export interface IChatService
{
    setName(val: string): boolean;
    talk(str: string): void;
}