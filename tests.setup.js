/**
 * Setup environment variables to make
 * local environment test to pass
 */
module.exports = function setup () {
	process.env.NODE_ENV = 'test'
}
