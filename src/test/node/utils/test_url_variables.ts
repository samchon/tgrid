import { DomainError } from "tstl/exception/DomainError";
import { LengthError } from "tstl/exception/LengthError";
import { InvalidArgument } from "tstl/exception/InvalidArgument";
import { Pair } from "tstl/utility/Pair";
import { equal } from "tstl/algorithm/iterations";

import { URLVariables } from "../../../utils/URLVariables";

type Element = Pair<string, string>;
interface IAuthor
{
    name: string;
    age: number;
    git: string;
    homepage: string;
    memo: string;
    is_crazy: boolean;

    [key: string]: any;
}

function test_global(author: IAuthor): void
{
    //----
    // STRINGIFY & PARSE
    //----
    // STRINGIFY -> OBJECT TO URL-ENCODED STRING
    const url_encoded_str: string = URLVariables.stringify(author);

    // PARSE -> URL-ENCODED STRING TO OBJECT
    const obj: IAuthor = URLVariables.parse(url_encoded_str, true);

    //----
    // VALIDATE
    //----
    // VALIDATE STRINGIFY
    if (url_encoded_str !== URLVariables.stringify(obj))
        throw new DomainError("Error on URLVariables.decode().");

    // VALIDATE PARSE -> (AUTHOR === OBJ)?
    for (const key in author)
        if (author[key] !== obj[key])
            throw new DomainError("Error on URLVariables.parse().");
}

function test_class(author: IAuthor): void
{
    //----
    // GENERATE URL-VARIABLES OBJECT
    //----
    const dict: URLVariables = new URLVariables();
    
    // FILL ELEMENTS
    dict.set("name", author.name);
    dict.set("age", String(author.age)); // MUST BE STRING
    dict.set("git", author.git);
    dict.set("homepage", author.homepage);
    dict.set("memo", author.memo);
    dict.set("is_crazy", String(author.is_crazy));

    // CONVERT THE URL-VARIABLES OBJECT TO URL-ENCODED STRING
    const url_encoded_str: string = dict.toString();

    //----
    // VALIDATIONS
    //----
    // CREATE A NEW URL-VARIABLES OBJECT 
    // BY PARSING THE URL-ENCODED STRING
    const vars: URLVariables = new URLVariables(url_encoded_str);

    // VALIDATE SIZE
    if (dict.size() !== vars.size())
        throw new LengthError("Size are different.");

    // ALL ELEMENTS ARE EQUAL
    const equality: boolean = equal
    (
        dict.begin(), dict.end(), vars.begin(), 
        function (x: Element, y: Element): boolean
        {
            return x.first === y.first && x.second === y.second;
        }
    );
    if (equality === false)
        throw new InvalidArgument("Elements are different.");

    // ALL ELEMENTS ARE EQUAL, THEN ENCODINGS MUST BE SAME
    if (dict.toString() !== vars.toString())
        throw new DomainError("Error on URLVariables.toString().");
}

export function test_url_variables(): void
{
    const author: IAuthor = 
    {
        name: "Samchon (Jeongho Nam)",
        age: 29,
        git: "https://github.com/samchon/tstl",
        homepage: "http://samchon.org",
        memo: "Hello, I'm the best programmer in Korea.",
        is_crazy: true
    };
    test_global(author);
    test_class(author);
}