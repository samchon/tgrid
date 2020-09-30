/** 
 * @packageDocumentation
 * @module tgrid.utils
 */
//----------------------------------------------------------------
import { Dictionary } from "./internal/Dictionary";
import { XMLList } from "./XMLList";

import { IPair } from "tstl/utility/IPair";
import { Pair } from "tstl/utility/Pair";
import { HashMap } from "tstl/container/HashMap";

import { DomainError } from "tstl/exception/DomainError";
import { OutOfRange } from "tstl/exception/OutOfRange";

/**
 * The XML parser
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export class XML
	extends Dictionary<XMLList>
	implements Omit<HashMap<string, XMLList>, "toJSON">
{
	/**
	 * @hidden
	 */
	private tag_!: string;

	/**
	 * @hidden
	 */
	private value_!: string;

	/**
	 * @hidden
	 */
	private property_map_!: HashMap<string, string>;

	/* =============================================================
		CONSTRUCTORS
			- BASIC CONSTRUCTORS
			- PARSERS
	================================================================
		BASIC CONSTRUCTORS
	------------------------------------------------------------- */
	public constructor();
	public constructor(str: string);
	public constructor(xml: XML);

	public constructor(obj?: string | XML)
	{
		super();

		if (obj instanceof XML)
			this._Copy_constructor(obj);
		else
		{
			this.property_map_ = new HashMap<string, string>();
			this.value_ = "";

			if (obj !== undefined && typeof obj === "string")
				this._Parser_constructor(obj);
		}
	}

	/**
	 * @hidden
	 */
	private _Copy_constructor(obj: XML): void
	{
		// COPY MEMBERS
		this.tag_ = obj.tag_;
		this.value_ = obj.value_;
		this.property_map_ = new HashMap(obj.property_map_);

		// COPY CHILDREN
		for (const entry of obj)
		{
			const xml_list: XMLList = new XMLList();
			for (const child of entry.second)
				xml_list.push_back(new XML(child));

			this.emplace(entry.first, xml_list);
		}
	}

	/**
	 * @hidden
	 */
	private _Parser_constructor(str: string): void
	{
		if (str.indexOf("<") === -1)
			return;

		let start: number;
		let end!: number;

		//ERASE HEADER OF XML
		if ((start = str.indexOf("<?xml")) !== -1) 
		{
			end = str.indexOf("?>", start);

			if (end !== -1)
				str = str.substr(end + 2);
		}

		//ERASE COMMENTS
		while ((start = str.indexOf("<!--")) !== -1) 
		{
			end = str.indexOf("-->", start);
			if (end === -1)
				break;

			str = str.substr(0, start) + str.substr(end + 3);
		}

		// ERASE !DOCTYPE
		start = str.indexOf("<!DOCTYPE");
		if (start !== -1)
		{
			let open_cnt: number = 1;
			let close_cnt: number = 0;

			for (let i: number = start + 1; i < str.length; ++i)
			{
				let ch: string = str.charAt(i);
				if (ch === "<")
					++open_cnt;
				else if (ch === ">")
				{
					++close_cnt;
					end = i;

					if (open_cnt === close_cnt)
						break;
				}
			}

			if (open_cnt !== close_cnt)
				throw new DomainError("Error on XML.constructor(): invalid XML format was found on the <!DOCTYPE />");

			str = str.substr(0, start) + str.substr(end + 1);
		}

		//BEGIN PARSING
		this._Parse(str);
	}

	/* -------------------------------------------------------------
		PARSERS
	------------------------------------------------------------- */
	/**
	 * @hidden
	 */
	private _Parse(str: string): void
	{
		this._Parse_tag(str);
		this._Parse_properties(str);

		const res = this._Parse_value(str);
		if (res.second === true)
			this._Parse_children(res.first);
	}

	/**
	 * @hidden
	 */
	private _Parse_tag(str: string): void
	{
		const start: number = str.indexOf("<") + 1;
		const end: number =
			XML._Compute_min_index
			(
				str.indexOf(" ", start),
				str.indexOf("\r\n", start),
				str.indexOf("\n", start),
				str.indexOf("\t", start),
				str.indexOf(">", start),
				str.indexOf("/", start)
			);
		if (start === 0 || end === -1)
			throw new DomainError("Error on XML.constructor(): invalid XML format, unable to parse tag.");

		this.tag_ = str.substring(start, end);
	}

	/**
	 * @hidden
	 */
	private _Parse_properties(str: string): void
	{
		let start: number = str.indexOf("<" + this.tag_) + this.tag_.length + 1;
		const end: number = XML._Compute_min_index(str.lastIndexOf("/"), str.indexOf(">", start));

		if (start === -1 || end === -1 || start >= end)
			return;

		//<comp label='ABCD' /> : " label='ABCD' "
		const line: string = str.substring(start, end);
		if (line.indexOf("=") === -1)
			return;

		let label: string;
		let value: string;
		let helpers: IQuote[] = [];

		let inQuote: boolean = false;
		let quoteType!: number;
		let equal: number;

		//INDEXING
		for (let i: number = 0; i < line.length; ++i)
		{
			//Start of quote
			if (inQuote === false && (line.charAt(i) === "'" || line.charAt(i) === "\"")) 
			{
				inQuote = true;
				start = i;

				if (line.charAt(i) === "'")
					quoteType = 1;
				else if (line.charAt(i) === "\"")
					quoteType = 2;
			}
			else if
				(
					inQuote === true &&
					(
						(quoteType === 1 && line.charAt(i) === "'") ||
						(quoteType === 2 && line.charAt(i) === "\"")
					)
				) 
			{
				helpers.push({ type: quoteType, start: start, end: i });
				inQuote = false;
			}
		}

		//CONSTRUCTING
		for (let i: number = 0; i < helpers.length; ++i)
		{
			if (i === 0) 
			{
				equal = line.indexOf("=");
				label = line.substring(0, equal).trim();
			}
			else 
			{
				equal = line.indexOf("=", helpers[i - 1].end + 1);
				label = line.substring(helpers[i - 1].end + 1, equal).trim();
			}
			value = line.substring(helpers[i].start + 1, helpers[i].end);

			this.setProperty(label, XML.decode_property(value));
		}
	}

	/**
	 * @hidden
	 */
	private _Parse_value(str: string): Pair<string, boolean>
	{
		const end_slash: number = str.lastIndexOf("/");
		const end_block: number = str.indexOf(">");

		if (end_slash < end_block || end_slash + 1 === str.lastIndexOf("<")) 
		{
			//STATEMENT1: <TAG />
			//STATEMENT2: <TAG></TAG> -> SAME WITH STATEMENT1: <TAG />
			this.value_ = "";

			return new Pair<string, boolean>(str, false);
		}

		const start: number = end_block + 1;
		const end: number = str.lastIndexOf("<");
		str = str.substring(start, end); //REDEFINE WEAK_STRING -> IN TO THE TAG

		if (str.indexOf("<") === -1)
			this.value_ = XML.decode_value(str.trim());
		else
			this.value_ = "";

		return new Pair<string, boolean>(str, true);
	}

	/**
	 * @hidden
	 */
	private _Parse_children(str: string): void
	{
		if (str.indexOf("<") === -1)
			return;

		let start: number = str.indexOf("<");
		let end: number = str.lastIndexOf(">") + 1;
		str = str.substring(start, end);

		let blockStart: number = 0;
		let blockEnd: number = 0;
		start = 0;

		for (let i: number = 0; i < str.length; ++i) 
		{
			if (str.charAt(i) === "<" && str.substr(i, 2) !== "</")
				++blockStart;
			else if (str.substr(i, 2) === "/>" || str.substr(i, 2) === "</")
				++blockEnd;

			if (blockStart >= 1 && blockStart === blockEnd) 
			{
				end = str.indexOf(">", i);

				const xml: XML = new XML();
				xml._Parse(str.substring(start, end + 1));
				
				let xmlList: XMLList;
				if (this.has(xml.tag_) === true)
					xmlList = this.get(xml.tag_);
				else 
				{
					xmlList = new XMLList();
					this.set(xml.tag_, xmlList);
				}
				xmlList.push(xml);

				i = end;
				start = end + 1;
				blockStart = 0;
				blockEnd = 0;
			}
		}
	}

	/* =============================================================
		ACCESSORS
			- GETTERS
			- SETTERS
			- ELEMENTS I/O
	================================================================
		GETTERS
	------------------------------------------------------------- */
	public getTag(): string
	{
		return this.tag_;
	}
	public getValue(): string
	{
		return this.value_;
	}

	public findProperty(key: string): HashMap.Iterator<string, string>
	{
		return this.property_map_.find(key);
	}
	public hasProperty(key: string): boolean
	{
		return this.property_map_.has(key);
	}
	public getProperty(key: string): string
	{
		return this.property_map_.get(key);
	}

	public getPropertyMap(): HashMap<string, string>
	{
		return this.property_map_;
	}

	/* -------------------------------------------------------------
		SETTERS
	------------------------------------------------------------- */
	public setTag(val: string): void
	{
		this.tag_ = val;
	}
	public setValue(val: string): void
	{
		this.value_ = val;
	}
	public insertValue(tag: string, value: string): XML
	{
		const xml = new XML();
		xml.setTag(tag);
		xml.setValue(value);

		this.push(xml);
		return xml;
	}

	public setProperty(key: string, value: string): void
	{
		this.property_map_.set(key, value);
	}
	public eraseProperty(key: string): void
	{
		const it = this.property_map_.find(key);
		if (it.equals(this.property_map_.end()) === true)
			throw new OutOfRange("Error on XML.eraseProperty(): unable to find the matched key.");

		this.property_map_.erase(it);
	}

	/* -------------------------------------------------------------
		ELEMENTS I/O
	------------------------------------------------------------- */
	public push(...args: IPair<string, XMLList>[]): number;
	public push(...xmls: XML[]): number;
	public push(...xmlLists: XMLList[]): number;

	public push(...items: any[]): number
	{
		for (const elem of items)
			if (elem instanceof XML)
				if (this.has(elem.tag_) === true)
					this.get(elem.tag_).push(elem);
				else 
				{
					const xmlList: XMLList = new XMLList();
					xmlList.push(elem);

					this.set(elem.tag_, xmlList);
				}
			else if (elem instanceof XMLList)
				if (elem.empty() === true)
					continue;
				else if (this.has(elem.getTag()) === true)
				{
					const xmlList: XMLList = this.get(elem.getTag());
					xmlList.insert(xmlList.end(), elem.begin(), elem.end());
				}
				else
					this.set(elem.getTag(), elem);
			else
				super.push(elem);

		return this.size();
	}

	/**
	 * @hidden
	 */
	protected _Handle_insert(first: HashMap.Iterator<string, XMLList>, last: HashMap.Iterator<string, XMLList>): void
	{
		for (let it = first; !it.equals(last); it = it.next())
		{
			const tag: string = it.first;
			const xmlList: XMLList = it.second;

			for (const xml of xmlList)
				if (xml.getTag() !== tag)
					xml.setTag(tag);
		}
		super._Handle_insert(first, last);
	}

	/* -------------------------------------------------------------
		STRING UTILS
    ------------------------------------------------------------- */
    public toJSON(): string
    {
        return this.toString();
    }

	public toString(): string;

	/**
	 * @internal
	 */
	public toString(level: number): string;

	public toString(tab: number = 0): string
	{
		let str: string = XML._Repeat("\t", tab) + "<" + this.tag_;

		//PROPERTIES
		for (const entry of this.property_map_)
			str += " " + entry.first + "=\"" + XML.encode_property(entry.second) + "\"";

		if (this.size() === 0) 
		{
			// VALUE
			if (this.value_ !== "")
				str += ">" + XML.encode_value(this.value_) + "</" + this.tag_ + ">";
			else
				str += " />";
		}
		else 
		{
			// CHILDREN
			str += ">\n";
			for (const entry of this)
				str += entry.second.toString(tab + 1);
			
			str += XML._Repeat("\t", tab) + "</" + this.tag_ + ">";
		}
		return str;
	}

	/**
	 * @hidden
	 */
	private static _Compute_min_index(...args: number[]): number 
	{
		let min: number = -1;

		for (const elem of args)
			if (elem === -1)
				continue;
			else if (min === -1 || elem < min)
				min = elem;
		
		return min;
	}

	/**
	 * @hidden
	 */
	private static _Repeat(str: string, n: number): string
	{
		let ret: string = "";
		for (let i: number = 0; i < n; ++i)
			ret += str;

		return ret;
	}
}

export namespace XML 
{
	export type Iterator = HashMap.Iterator<string, XMLList>;
	export type ReverseIterator = HashMap.ReverseIterator<string, XMLList>;

	export function head(encoding: string = "utf-8"): string
	{
		return `<?xml version="1.0" encoding="${encoding}" ?>`;
	}

	export function encode_value(str: string): string 
	{
		for (const p of VALUE_CODES)
			str = str.split(p.first).join(p.second);
		return str;
	}
	export function encode_property(str: string): string 
	{
		for (const p of PROPERTY_CODES)
			str = str.split(p.first).join(p.second);
		return str;
	}

	export function decode_value(str: string): string 
	{
		for (const p of VALUE_CODES)
			str = str.split(p.second).join(p.first);
		return str;
	}
	export function decode_property(str: string): string 
	{
		for (const p of PROPERTY_CODES)
			str = str.split(p.second).join(p.first);
		return str;
	}

	/**
	 * @hidden
	 */
	const VALUE_CODES: Pair<string, string>[] =
	[
		new Pair("&", "&amp;"),
		new Pair("<", "&lt;"),
		new Pair(">", "&gt;")
	];

	/**
	 * @hidden
	 */
	const PROPERTY_CODES: Pair<string, string>[] =
	[
		...VALUE_CODES,
		new Pair("\"", "&quot;"),
		new Pair("'", "&apos;"),
		new Pair("\t", "&#x9;"),
		new Pair("\n", "&#xA;"),
		new Pair("\r", "&#xD;")
	];
}

/**
 * @hidden
 */
interface IQuote
{
	type: number;
	start: number;
	end: number;
}