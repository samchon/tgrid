import { DomainError } from "tstl/exception/DomainError";
import { LengthError } from "tstl/exception/LengthError";

export interface IScript
{
    name: string;
    message: string;
}

export namespace IScript
{
    export const SCENARIO: IScript[] = 
    [
        { name: "Administrator", message: "The Chat Application has been started." },
        { name: "Jeongho Nam", message: "Hello, my name is Jeongho Nam, author of the TGrid." },
        { name: "Sam", message: "I'm Sam, nice to meet you." },
        { name: "Administrator", message: "Welcome two participants. Nice to meet you too." },
        { name: "Jeongho Nam", message: "Nice to meet you three." },
        { name: "Mad Scientist", message: "HAHAHAHAHAHA" },
        { name: "Sam", message: "???????" },
        { name: "Jeongho Nam", message: "I'm going to sleep. See you tomorrow." },
        { name: "Administrator", message: "See ya~" },
        { name: "Mad Scientist", message: "Conquer all over the world~!!" },
        { name: "Sam", message: "Good bye~!!" }
    ];
    export const PEOPLE: string[] = [...new Set(SCENARIO.map(script => script.name))];

    export function validate(scriptList: IScript[]): void
    {
        // VALIDATE LENGTH
        if (scriptList.length !== SCENARIO.length)
            throw new LengthError("Different length between two scripts.");
    
        // VALIDATE MESSAGES
        for (const script of scriptList)
        {
            const index: number = SCENARIO.findIndex(s => 
            {
                return s.name === script.name 
                    && s.message === script.message;
            });
            if (index === -1)
                throw new DomainError("Different script exists.");
        }
    }
}