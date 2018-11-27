import { HashMap } from "tstl/container/HashMap";
import { LockType } from "tstl/base/thread/enums";
import { Pair } from "tstl/utility/Pair";

import { sleep_for } from "tstl/thread/global";

/**
 * @hidden
 */
export class ConditionVariable
{
	/**
	 * @hidden
	 */
	private resolvers_: HashMap<IResolver, LockType>;

	/* ---------------------------------------------------------
		CONSTRUCTORS
	--------------------------------------------------------- */
	/**
	 * Default Constructor.
	 */
	public constructor()
	{
		this.resolvers_ = new HashMap();
	}

	/* ---------------------------------------------------------
		WAITERS
	--------------------------------------------------------- */
	/**
	 * Wait until notified.
	 */
	public wait(): Promise<void>
	{
		return new Promise<void>((resolve, reject) => 
		{
			this.resolvers_.emplace(new Pair(resolve, reject), LockType.HOLD);
		});
	}

	/**
	 * Wait for timeout or until notified.
	 * 
	 * @param ms The maximum miliseconds for waiting.
	 * @return Whether awaken by notification or timeout.
	 */
	public wait_for(ms: number): Promise<boolean>
	{
		return new Promise<boolean>((resolve, reject) =>
		{
			let pair: IResolver = new Pair(resolve, reject);
			this.resolvers_.emplace(pair, LockType.KNOCK);

			// AUTOMATIC UNLOCK
			sleep_for(ms).then(() =>
			{
				if (this.resolvers_.has(pair) === false)
					return;

				// DO UNLOCK
				this.resolvers_.erase(pair); // POP THE LISTENER
				resolve(false); // RETURN FAILURE
			});
		});
	}

	/**
	 * Wait until notified or time expiration.
	 * 
	 * @param at The maximum time point to wait.
	 * @return Whether awaken by notification or time expiration.
	 */
	public wait_until(at: Date): Promise<boolean>
	{
		// COMPUTE MILLISECONDS TO WAIT
		let now: Date = new Date();
		let ms: number = at.getTime() - now.getTime();

		return this.wait_for(ms);
	}

	/* ---------------------------------------------------------
		NOTIFIERS
	--------------------------------------------------------- */
	/**
	 * Notify, wake one.
	 */
	public async notify_one(error?: Error): Promise<void>
	{
		// NOTHING TO NOTIFY
		if (this.resolvers_.empty())
			return;

		// THE 1ST RESOLVER
		let it = this.resolvers_.begin();
		if (error)
			it.first.second(error);
		else if (it.second === LockType.HOLD)
			it.first.first();
		else
			it.first.first(true);

		// ERASE IT
		this.resolvers_.erase(it);	
	}

	/**
	 * Notify, wake all
	 */
	public async notify_all(error?: Error): Promise<void>
	{
		// NOTHING TO NOTIFY
		if (this.resolvers_.empty())
			return;

		// ITERATE RESOLVERS
		for (let entry of this.resolvers_)
			if (error)
				entry.first.second(error);
			else if (entry.second === LockType.HOLD)
				entry.first.first();
			else
				entry.first.first(true);
		
		// ERASE THEM ALL
		this.resolvers_.clear();
	}
}

/**
 * @hidden
 */
type IResolver = Pair<(value?: any) => void, (error: Error) => void>;

export type condition_variable = ConditionVariable;
export const condition_variable = ConditionVariable;