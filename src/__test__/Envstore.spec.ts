import Envstore from '../index'

describe('Envstore', () => {
	let envstore: Envstore
	const processDotEnv = {
		NODE_ENV: 'development',
		X: 'a,b,c',
		Y0: 'yes',
		Y1: '1',
		Y2: 'true',
		Y3: 'false',
		Y4: true,
		Z: '2.5',
		W: '10',
		K: '{"x":5}',
		J: 'text'
	}

	beforeEach(() => {
		envstore = new Envstore(processDotEnv, processDotEnv.NODE_ENV)
	})

	test('setup()', async () => {
		const dynamicSettings = {
			I: 'random'
		}

		await envstore.setup({
			development: env => env.merge(dynamicSettings)
		})

		expect(envstore.vars).toEqual({ ...processDotEnv, ...dynamicSettings })
	})

	test('bad setup()', async () => {
		const env = () => new Envstore({ NODE_ENV: 10 }, undefined)

		expect(env).toThrow()
	})

	test('env setup()', async () => {
		const env1 = new Envstore({ NODE_ENV: 'production' })
		const env2 = new Envstore({ ENV: 'production' })
		const env3 = new Envstore({ ENVIRONMENT: 'production' })

		expect(env1.env).toBe('production')
		expect(env2.env).toBe('production')
		expect(env3.env).toBe('production')
	})

	test('setup() process.env', async () => {
		const env = new Envstore()

		const mock1 = jest.fn()
		await env.setup({
			test: mock1
		})
		expect(mock1).toHaveBeenCalled()

		const mock2 = jest.fn()
		await env.setup({
			production: mock2
		})
		expect(mock2).toHaveBeenCalledTimes(0)
	})

	test('array()', async () => {
		const X = envstore.array('X')
		expect(X).toEqual(['a', 'b', 'c'])

		const X_ = envstore.array('X_', ['x', 'y'])
		expect(X_).toEqual(['x', 'y'])
	})

	test('boolean()', async () => {
		const X = envstore.array('X')
		expect(X).toEqual(['a', 'b', 'c'])

		const X_ = envstore.bool('X_', false)
		expect(X_).toBe(false)

		const Y0 = envstore.bool('Y0')
		expect(Y0).toBe(true)

		const Y1 = envstore.bool('Y1')
		expect(Y1).toBe(true)

		const Y2 = envstore.bool('Y2')
		expect(Y2).toBe(true)

		const Y3 = envstore.bool('Y3')
		expect(Y3).toBe(false)

		const Y4 = envstore.bool('Y4')
		expect(Y4).toBe(true)
	})

	test('float()', async () => {
		const Z = envstore.float('Z')
		expect(Z).toBe(parseFloat(processDotEnv.Z))

		const Z_ = envstore.float('Z_', 10)
		expect(Z_).toBe(10)

		const J = envstore.float('J')
		expect(J).toBe(NaN)
	})

	test('integer()', async () => {
		const W = envstore.int('W')
		expect(W).toBe(parseInt(processDotEnv.W, 10))

		const W_ = envstore.int('W_', 50)
		expect(W_).toBe(50)

		const J = envstore.int('J')
		expect(J).toBe(NaN)
	})

	test('json()', async () => {
		const K = envstore.json('K')
		expect(K).toEqual(JSON.parse(processDotEnv.K))

		const K_ = envstore.json('K_', { x: 1 })
		expect(K_).toEqual({ x: 1 })

		const J = () => envstore.json('J')
		expect(J).toThrow()
	})

	test('string()', async () => {
		const J = envstore.str('J')
		expect(J).toEqual(processDotEnv.J)
	})

	test('string()', async () => {
		const Q = () => envstore.str('Q')
		expect(Q).toThrow()
	})

	test('pick()', async () => {
		// Env1: USER is set on process.env
		const env1 = new Envstore({ NODE_ENV: 'development', USER: 'root' })
		const user1 = env1.pick('USER', {
			development: prop => env1.string(prop)
		})
		expect(user1).toBe('root')

		// Env2: USER is not set on process.env, but there is an environment default
		const env2 = new Envstore({ NODE_ENV: 'development' })
		const user2 = env2.pick('USER', {
			development: prop => env2.string(prop, 'root')
		})
		expect(user2).toBe('root')

		// Env3: USER is not set on process.env, but there is a global default
		const env3 = new Envstore({ NODE_ENV: 'development' })
		const user3 = env3.pick(
			'USER',
			{
				production: prop => env3.string(prop)
			},
			() => 'root'
		)
		expect(user3).toBe('root')

		// Env4: USER is not set on process.env and there is no defaults
		const env4 = new Envstore({ NODE_ENV: 'development' })
		const user4 = () =>
			env4.pick('USER', {
				production: prop => env4.string(prop)
			})
		expect(user4).toThrow()
	})
})
