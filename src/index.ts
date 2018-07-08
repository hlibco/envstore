export interface IEnvironments {
	[key: string]: (env: Envstore) => any
}

export default class Envstore {
	readonly env: string = 'development'
	readonly vars: object = {}

	constructor(vars?: object, env?: string) {
		this.vars = vars || process.env

		if (env) {
			this.env = env
		} else {
			if (this.vars['NODE_ENV']) {
				this.env = this.vars['NODE_ENV']
			}
			if (this.vars['ENV']) {
				this.env = this.vars['ENV']
			}
			if (this.vars['ENVIRONMENT']) {
				this.env = this.vars['ENVIRONMENT']
			}
		}

		if (typeof this.env !== 'string') {
			throw new Error(
				`The environment name \`${this.env}\` must be a valid string.`
			)
		}
	}

	async setup(environments: IEnvironments): Promise<void> {
		if (environments[this.env]) {
			await environments[this.env](this)
		}
	}

	merge(vars: object) {
		Object.assign(this.vars, vars)
	}

	pick<T>(prop: string, envs: object, fallback?): T {
		if (envs[this.env]) {
			return envs[this.env](prop)
		} else if (fallback) {
			return fallback(prop)
		}

		throw new Error(
			`Environment \`${
				this.env
			}\` is missing in \`${envs}\` and fallback was not provided.`
		)
	}

	array<T>(name: string, fallback?: T[]): T[] {
		const value: string | any[] = this.get<string, T[]>(name, fallback)

		return Array.isArray(value) ? value : value.split(',')
	}

	bool(name: string, fallback?: boolean): boolean {
		return this.boolean(name, fallback)
	}

	boolean(name: string, fallback?: boolean): boolean {
		const value = this.get<string, boolean>(name, fallback)

		if (!value) {
			return false
		}
		if (typeof value === 'boolean') {
			return value
		}

		return !!~['true', 'yes', '1'].indexOf(value.toLocaleLowerCase())
	}

	float(name: string, fallback?: number): number {
		const value = this.get<string, number>(name, fallback)
		if (typeof value === 'number') {
			return value
		}

		return parseFloat(value)
	}

	int(name: string, fallback?: number): number {
		return this.integer(name, fallback)
	}

	integer(name: string, fallback?: number): number {
		const value = this.get<string, number>(name, fallback)
		return typeof value === 'number' ? value : parseInt(value, 10)
	}

	json(name: string, fallback?: object): object {
		const value = this.get<string, object>(name, fallback)
		return typeof value === 'object' ? value : JSON.parse(value)
	}

	str(name: string, fallback?: string): string {
		return this.string(name, fallback)
	}

	string(name: string, fallback?: string): string {
		return this.get<string, string>(name, fallback)
	}

	private get<T, K>(name: string, fallback?): T | K {
		const value = this.vars[name]

		if (value) {
			return value
		} else if (typeof fallback !== 'undefined') {
			return fallback
		}

		throw new Error(`Environment variable \`${name}\` must be defined.`)
	}
}
