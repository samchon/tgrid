import { DomainError } from "tstl/exception";
import { Pair } from "tstl/utility/Pair";
import { Vector } from "tstl/container/Vector";

import { XML } from "../../../utils/XML";
import { XMLList } from "../../../utils/XMLList";

class Invoke extends Vector<Parameter>
{
	public listener: string;

	public constructor(listener: string)
	{
		super();

		this.listener = listener;
	}

	public toXML(): XML
	{
		let ret: XML = new XML();
		ret.setTag("invoke");
		ret.setProperty("listener", this.listener);

		for (let param of this)
			ret.push(param.toXML());

		return ret;
	}
}

class Parameter
{
	public name: string;
	public type: string;
	public value: string | XML | null;

	public constructor(name: string, type: string, value: string | XML | null = null)
	{
		this.name = name;
		this.type = type;
		this.value = value;
	}

	public toXML(): XML
	{
		let ret: XML = new XML();
		ret.setTag("parameter");

		ret.setProperty("name", this.name);
		ret.setProperty("type", this.type);
		
		if (this.value !== null)
			if (this.value instanceof XML)
				ret.push(this.value as XML);
			else
				ret.setValue(this.value as string);

		return ret;
	}
}

class Member
{
	public id: string;
	public email: string;
	public name: string;

	public constructor(id: string, email: string, name: string)
	{
		this.id = id;
		this.email = email;
		this.name = name;
	}

	public toXML(): XML
	{
		let ret: XML = new XML();
		ret.setTag("member");

		ret.setProperty("id", this.id);
		ret.setProperty("email", this.email);
		ret.setProperty("name", this.name);

		return ret;
	}
}

function validate_equality<T>(x: T, y: T): void
{
	if (x !== y)
		throw new DomainError("Error on XML Parser.");
}

function write(): Pair<Invoke, Vector<Member>>
{
	let invoke: Invoke = new Invoke("setMemberList");
	invoke.push_back(new Parameter("application", "string", "simulation"));
	invoke.push_back(new Parameter("sequence", "number", "3"));

	let members: Vector<Member> = new Vector();
	members.push
	(
		new Member("samchon", "samchon@samchon.org", "Jeongho Nam"),
		new Member("github", "github@github.com", "GitHub"),
		new Member("robot", "google@google.com", "AlphaGo")
	);

	let memberList: XML = new XML();
	memberList.setTag("memberList");

	for (let elem of members)
		memberList.push(elem.toXML());

	invoke.push_back(new Parameter("memberList", "XML", memberList));

	return new Pair(invoke, members);
}

function read(pair: Pair<Invoke, Vector<Member>>): void
{
	let invoke: Invoke = pair.first;
	let members: Vector<Member> = pair.second;

	// CREATE AN XML OBJECT BY PARSING CHARACTERS
	let xml: XML = pair.first.toXML();

	//----
	// CONVERTING TESTS
	//----
	let xml2: XML = new XML(xml.toString());
	let xml3: XML = new XML(xml);

	validate_equality(xml.toString(), xml2.toString());
	validate_equality(xml2.toString(), xml3.toString());
	
	//----
	// LIST OF PARAMETER OBJECTS
	//----
	// XML => HashMap<string, XMLList>
	// XMLList => Vector<XML>
	let xmlList: XMLList = xml.get("parameter");

	// VALIDATE SIZE
	validate_equality(xmlList.size(), invoke.size());

	// VALIDATE MEMBERS OF PARAMETERS
	for (let i: number = 0; i < invoke.size(); ++i)
	{
		let param: Parameter = invoke.at(i);
		let child: XML = xmlList.at(i);

		validate_equality(param.name, child.getProperty("name"));
		validate_equality(param.type, child.getProperty("type"));

		if (typeof param.value === "string")
			validate_equality(param.value, child.getValue());
	}

	//----
	// ACCESS TO CHILDREN XML OBJECTS
	//----
	xmlList = xml.get("parameter").at(2)
		.get("memberList").at(0)
		.get("member");

	// VALIDATE SIZE
	validate_equality(xmlList.size(), members.size());

	// VALIDATE MEMBERS OF MEMBERS
	for (let i: number = 0; i < members.size(); ++i)
	{
		let member: Member = members.at(i);
		let child: XML = xmlList.at(i);

		validate_equality(member.id, child.getProperty("id"));
		validate_equality(member.email, child.getProperty("email"));
		validate_equality(member.name, child.getProperty("name"));
	}
}

export function test_xml(): void
{
	read(write());
}